'use client'
import { useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, CreditCard, Smartphone } from 'lucide-react'
import { useLoanStore } from '@/features/request-loan'
import { loanRepository } from '@/features/request-loan'
import { useAuthStore } from '@/features/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { formatCurrency } from '@/shared/lib/utils'

const manualSchema = z.object({
  amount:    z.number({ invalid_type_error: 'Ingresa un monto' }).positive('Debe ser mayor a 0'),
  method:    z.enum(['YAPE', 'PLIN', 'BANK_TRANSFER', 'CASH'], { required_error: 'Selecciona un método' }),
  reference: z.string().optional(),
})
type ManualInput = z.infer<typeof manualSchema>

const MANUAL_METHODS = [
  { value: 'YAPE' as const,          label: 'Yape',          icon: '📱' },
  { value: 'PLIN' as const,          label: 'Plin',          icon: '📲' },
  { value: 'BANK_TRANSFER' as const, label: 'Transferencia', icon: '🏦' },
  { value: 'CASH' as const,          label: 'Efectivo',      icon: '💵' },
]

export default function PayLoanPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const router = useRouter()
  const { selectedLoan: loan, balance, isLoading, loadLoanDetails, payLoan } = useLoanStore()
  const { user } = useAuthStore()

  useEffect(() => { loadLoanDetails(loanId) }, [loanId, loadLoanDetails])

  const form = useForm<ManualInput>({
    resolver: zodResolver(manualSchema),
    defaultValues: { amount: 0, method: 'YAPE', reference: '' },
  })

  useEffect(() => {
    if (balance) form.setValue('amount', balance.remaining)
  }, [balance, form])

  // ─── Pago con tarjeta via Culqi ───────────────────────────────────────────
  const handleCardPayment = useCallback(() => {
    const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
    if (!publicKey) { toast.error('El pago con tarjeta no está disponible en este momento.'); return }
    if (!balance) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CulqiConstructor = (window as any).Culqi
    if (!CulqiConstructor) {
      toast.error('Cargando pasarela de pago, intenta en un momento.')
      return
    }

    const culqi = new CulqiConstructor({ publicKey })

    culqi.open({
      settings: {
        title:       'Solvo',
        currency:    'PEN',
        description: `Pago préstamo #${loanId.substring(0, 8).toUpperCase()}`,
        amount:      Math.round(balance.remaining * 100),
      },
    })

    culqi.on('token', async ({ id: culqiToken }: { id: string }) => {
      culqi.close()
      try {
        await loanRepository.chargeCard({ loanId, amount: balance.remaining, culqiToken })
        toast.success('¡Pago con tarjeta procesado correctamente!')
        router.push(`/loans/${loanId}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al procesar el pago')
      }
    })

    culqi.on('error', (err: { user_message?: string }) => {
      toast.error(err.user_message || 'Error en la pasarela de pago.')
    })
  }, [balance, loanId, router])

  // ─── Pago manual (Yape, Plin, etc.) ──────────────────────────────────────
  const onSubmit = async (values: ManualInput) => {
    try {
      await payLoan(loanId, values)
      toast.success('¡Pago registrado! El equipo Solvo lo verificará pronto.')
      router.push(`/loans/${loanId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar el pago')
    }
  }

  if (isLoading || !loan || !balance) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/loans/${loanId}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-xl font-bold">Realizar pago</h1>
      </div>

      {/* Resumen */}
      <Card>
        <CardHeader><CardTitle>Saldo pendiente</CardTitle></CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{formatCurrency(balance.remaining)}</p>
          {balance.dueDate && (
            <p className="text-sm text-muted-foreground mt-1">
              Vence el {new Date(balance.dueDate).toLocaleDateString('es-PE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Opción 1: Tarjeta (Culqi) */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" /> Pagar con tarjeta
          </CardTitle>
          <CardDescription>Visa o Mastercard — confirmación inmediata</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full gap-2" onClick={handleCardPayment} disabled={!user}>
            <CreditCard className="h-4 w-4" />
            Pagar {formatCurrency(balance.remaining)} con tarjeta
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground px-2">o paga con billetera / transferencia</span>
        <Separator className="flex-1" />
      </div>

      {/* Opción 2: Métodos manuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-5 w-5" /> Yape / Plin / Transferencia
          </CardTitle>
          <CardDescription>Ingresa el número de operación y nuestro equipo lo verificará</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a pagar (S/)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>Método</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {MANUAL_METHODS.map(m => (
                        <button key={m.value} type="button" onClick={() => field.onChange(m.value)}
                          className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-all
                            ${field.value === m.value
                              ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                              : 'border-input hover:bg-accent'
                            }`}
                        >
                          <span className="mr-1.5">{m.icon}</span>{m.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de operación</FormLabel>
                  <FormControl><Input placeholder="Ej: 123456789" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" variant="outline" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Registrando...</>
                  : 'Registrar pago manual'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
