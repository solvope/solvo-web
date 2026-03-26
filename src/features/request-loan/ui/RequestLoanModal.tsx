'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useLoanStore } from '../model/useLoanStore'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { formatCurrency, calculateTotalWithInterest } from '@/shared/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const TERM_OPTIONS = [
  { value: '7',  label: '7 días' },
  { value: '14', label: '14 días' },
  { value: '30', label: '30 días' },
]

const requestLoanSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .min(100, 'El monto mínimo es S/ 100')
    .max(2000, 'El monto máximo es S/ 2,000'),
  termDays: z.enum(['7', '14', '30'], { required_error: 'Selecciona un plazo' }),
})
type RequestLoanInput = z.infer<typeof requestLoanSchema>

export function RequestLoanModal({ open, onClose }: Props) {
  const { requestLoan } = useLoanStore()

  const form = useForm<RequestLoanInput>({
    resolver: zodResolver(requestLoanSchema),
    defaultValues: { amount: 500, termDays: '14' },
  })

  const amount = form.watch('amount')
  const termDays = form.watch('termDays')
  const total = amount && termDays ? calculateTotalWithInterest(amount, Number(termDays)) : null

  const onSubmit = async (values: RequestLoanInput) => {
    try {
      await requestLoan({ amount: values.amount, termDays: Number(values.termDays) })
      toast.success('¡Solicitud enviada! Te notificaremos cuando sea aprobada.')
      form.reset()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar préstamo')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar préstamo</DialogTitle>
          <DialogDescription>
            Préstamos de S/ 100 a S/ 2,000. Aprobación en minutos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Monto (S/)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="500"
                    {...field}
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="termDays" render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    {TERM_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors
                          ${field.value === opt.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background hover:bg-accent'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {total && (
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto solicitado</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interés ({termDays} días)</span>
                  <span>{formatCurrency(total - amount)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                  <span>Total a pagar</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando solicitud...</>
                : 'Solicitar préstamo'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
