'use client'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useLoanStore } from '@/features/request-loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/shared/lib/utils'
import { PAYMENT_METHODS } from '@/shared/lib/constants'

const paySchema = z.object({
  amount: z.number({ invalid_type_error: 'Ingresa un monto' }).positive('Debe ser mayor a 0'),
  method: z.string().min(1, 'Selecciona un método'),
  reference: z.string().optional(),
})
type PayInput = z.infer<typeof paySchema>

export default function PayLoanPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const router = useRouter()
  const { selectedLoan: loan, balance, isLoading, loadLoanDetails, payLoan } = useLoanStore()

  useEffect(() => { loadLoanDetails(loanId) }, [loanId, loadLoanDetails])

  const form = useForm<PayInput>({
    resolver: zodResolver(paySchema),
    defaultValues: { amount: 0, method: '', reference: '' },
  })

  useEffect(() => {
    if (balance) form.setValue('amount', balance.remaining)
  }, [balance, form])

  const onSubmit = async (values: PayInput) => {
    try {
      await payLoan(loanId, values)
      toast.success('¡Pago registrado exitosamente!')
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

      <Card>
        <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Saldo pendiente</span>
            <span className="font-bold text-primary">{formatCurrency(balance.remaining)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Datos del pago</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a pagar (S/)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pago</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map(method => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => field.onChange(method.value)}
                          className={`rounded-md border px-3 py-2 text-sm text-left transition-colors
                            ${field.value === method.value
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-input hover:bg-accent'
                            }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de operación (opcional)</FormLabel>
                  <FormControl><Input placeholder="Ej: 123456789" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Registrando...</>
                  : 'Confirmar pago'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
