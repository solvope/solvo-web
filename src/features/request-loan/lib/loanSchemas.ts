import { z } from 'zod'

export const requestLoanSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .min(200, 'El monto mínimo es S/ 200')
    .max(2000, 'El monto máximo es S/ 2,000'),
  termDays: z.enum(['7', '14', '30'], { required_error: 'Selecciona un plazo' }),
  purpose: z.string().min(5, 'Describe el propósito del préstamo').max(200),
})

export type RequestLoanInput = z.infer<typeof requestLoanSchema>
