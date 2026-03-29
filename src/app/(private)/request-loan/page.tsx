'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import { useLoanStore, loanRepository, type SimulationResult } from '@/features/request-loan'
import { kycRepository } from '@/features/upload-kyc'
import { useAuthStore } from '@/features/auth'
import { formatCurrency } from '@/shared/lib/utils'
import { InfoTooltip } from '@/shared/ui/info-tooltip'
import Link from 'next/link'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/[0.06] rounded-lg'
const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-[#F9FAFB] dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500'

const TOOLTIPS = {
  techFee: 'Cubre los costos de la plataforma digital, verificación de identidad y procesamiento de tu solicitud.',
  disbursementFee: 'Cubre la transferencia del dinero a tu cuenta. Se descuenta del monto que recibes.',
  maintenanceFee: 'Cubre la administración de tu cuenta durante la vigencia del préstamo.',
  igv: 'Impuesto General a las Ventas (18%) aplicado sobre las comisiones.',
  tcea: 'Tasa de Costo Efectivo Anual. Refleja el costo total del préstamo incluyendo intereses y comisiones.',
}

const PRODUCTS = [
  { value: 'EXPRESS', label: 'Solvo Express', sublabel: '1 cuota', icon: 'fa-solid fa-bolt', desc: 'Pago único al vencimiento. Ideal para necesidades inmediatas.' },
  { value: 'FLEX', label: 'Solvo Flex', sublabel: '2 cuotas', icon: 'fa-solid fa-layer-group', desc: 'Dos pagos quincenales. Mayor comodidad para tu bolsillo.' },
]

const requestSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .min(200, 'El monto mínimo es S/ 200')
    .max(2000, 'El monto máximo es S/ 2,000'),
  productType: z.enum(['EXPRESS', 'FLEX']),
})
type RequestInput = z.infer<typeof requestSchema>

export default function RequestLoanPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { requestLoan } = useLoanStore()
  const [kycApproved, setKycApproved] = useState<boolean | null>(null)
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  useEffect(() => {
    kycRepository.getStatus()
      .then(s => setKycApproved(s.isIdentityVerified))
      .catch(() => setKycApproved(false))
  }, [])

  const form = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    defaultValues: { amount: 500, productType: 'EXPRESS' },
  })

  const amount = form.watch('amount')
  const productType = form.watch('productType')

  const runSimulation = useCallback(async (amt: number, prod: string) => {
    if (!amt || amt < 200 || amt > 2000) { setSimulation(null); return }
    setSimLoading(true)
    try {
      const result = await loanRepository.simulate({ amount: amt, productType: prod, paymentFrequency: 'MENSUAL' })
      setSimulation(result)
    } catch {
      setSimulation(null)
    } finally {
      setSimLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => runSimulation(amount, productType), 400)
    return () => clearTimeout(t)
  }, [amount, productType, runSimulation])

  const onSubmit = async (values: RequestInput) => {
    try {
      await requestLoan({ amount: values.amount, termDays: values.productType === 'FLEX' ? 60 : 30 })
      toast.success('¡Solicitud enviada! Te notificaremos cuando sea aprobada.')
      router.push('/loans')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar préstamo')
    }
  }

  // KYC not verified
  if (kycApproved === false) {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <h1 className="text-3xl font-bold text-[#0A192F] dark:text-white mb-1">Solicitar Préstamo</h1>
          <p className="text-gray-500 dark:text-gray-400">Primero necesitas verificar tu identidad.</p>
        </div>
        <div className={`${cardCls} p-8 text-center`}>
          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <i className="fa-solid fa-id-card text-3xl text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-[#0A192F] dark:text-white mb-2">Verifica tu identidad</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Para solicitar un préstamo, necesitamos verificar tu identidad con tu DNI y una selfie. Es rápido y seguro.
          </p>
          <Link
            href="/kyc"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A192F] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#B8941F] transition-colors "
          >
            <i className="fa-solid fa-shield-halved" />
            Verificar identidad ahora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A192F] dark:text-white mb-1">Solicitar Préstamo</h1>
          <p className="text-gray-500 dark:text-gray-400">De S/ 200 a S/ 2,000 · Aprobación en minutos</p>
        </div>
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
            <i className="fa-solid fa-circle-check text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              {user.firstName}, tu identidad está verificada
            </span>
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-3 space-y-6">

            {/* Product selection */}
            <div className={cardCls}>
              <div className="p-6 border-b border-gray-100 dark:border-white/[0.06]">
                <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white">Elige tu modalidad</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecciona la opción que mejor se ajuste a ti</p>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRODUCTS.map(p => {
                  const selected = productType === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => form.setValue('productType', p.value as 'EXPRESS' | 'FLEX')}
                      className={`p-5 rounded-lg border-2 text-left transition-all ${selected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10'
                          : 'border-gray-100 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-gray-100 dark:bg-[#0F172A] text-gray-500 dark:text-gray-400'}`}>
                          <i className={`${p.icon} text-lg`} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${selected ? 'text-[#0A192F] dark:text-[#D4AF37]' : 'text-gray-800 dark:text-gray-200'}`}>{p.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.sublabel}</p>
                        </div>
                        {selected && <i className="fa-solid fa-circle-check text-[#D4AF37] ml-auto" />}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Amount */}
            <div className={cardCls}>
              <div className="p-6 border-b border-gray-100 dark:border-white/[0.06]">
                <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white">¿Cuánto necesitas?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mínimo S/ 200 · Máximo S/ 2,000</p>
              </div>
              <div className="p-6">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-sm">S/</span>
                  <input
                    type="number"
                    placeholder="500"
                    min="200"
                    max="2000"
                    className={`${inputCls} pl-10 text-lg font-bold`}
                    {...form.register('amount', { valueAsNumber: true })}
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="text-red-500 text-xs mt-2">{form.formState.errors.amount.message}</p>
                )}
                {/* Quick amount buttons */}
                <div className="flex gap-2 mt-4">
                  {[300, 500, 1000, 1500, 2000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => form.setValue('amount', v)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${amount === v
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0A192F] dark:text-[#D4AF37]'
                          : 'border-gray-100 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
                        }`}
                    >
                      {v >= 1000 ? `${v / 1000}k` : v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Personal info (read-only) */}
            <div className={cardCls}>
              <div className="p-6 border-b border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white">Datos del solicitante</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Información registrada en tu cuenta</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800/50">
                    Verificado
                  </span>
                </div>
              </div>
              {user && (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre completo', value: `${user.firstName} ${user.lastName}` },
                    { label: 'Correo electrónico', value: user.email },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{f.label}</label>
                      <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: simulation summary */}
          <div className="lg:col-span-2">
            <div className={`${cardCls} sticky top-8`}>
              <div className="p-6 border-b border-gray-100 dark:border-white/[0.06]">
                <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white">Resumen del préstamo</h2>
              </div>
              <div className="p-6">
                {simLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Calculando...
                  </div>
                ) : simulation ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Monto solicitado</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(simulation.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Interés (TEA {simulation.teaPercent}%)</span>
                      <span className="text-gray-800 dark:text-gray-200">{formatCurrency(simulation.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        Com. mantenimiento <InfoTooltip text={TOOLTIPS.maintenanceFee} />
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {formatCurrency(simulation.maintenanceFeeTotal)}
                        {simulation.numInstallments > 1 && (
                          <span className="text-xs text-gray-400 ml-1">
                            ({formatCurrency(simulation.maintenanceFee)} × {simulation.numInstallments})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between font-bold border-t border-gray-100 dark:border-white/[0.06] pt-3">
                      <span className="text-[#0A192F] dark:text-white">Total a devolver</span>
                      <span className="text-[#0A192F] dark:text-[#D4AF37] text-base">{formatCurrency(simulation.totalAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{simulation.numInstallments === 1 ? 'Cuota única' : `${simulation.numInstallments} cuotas de`}</span>
                      <span>{formatCurrency(simulation.installmentAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        Com. desembolso <InfoTooltip text={TOOLTIPS.disbursementFee} />
                      </span>
                      <span className="text-amber-500">− {formatCurrency(simulation.disbursementFee)}</span>
                    </div>

                    {/* Net disbursed */}
                    <div className="flex items-center justify-between rounded-lg bg-[#0A192F] dark:bg-[#D4AF37]/10 border border-[#0A192F]/20 dark:border-[#D4AF37]/30 px-4 py-3 mt-2">
                      <span className="text-xs font-medium text-white dark:text-[#D4AF37] flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        Recibes en tu cuenta
                      </span>
                      <span className="text-base font-bold text-white dark:text-[#D4AF37]">
                        {formatCurrency(simulation.netDisbursed)}
                      </span>
                    </div>

                    {/* Extra details */}
                    <div className="rounded-xl bg-gray-50 dark:bg-[#0F172A] px-3 py-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <p className="font-semibold text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Comisiones distribuidas</p>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">Com. tecnología <InfoTooltip text={TOOLTIPS.techFee} /></span>
                        <span>{formatCurrency(simulation.techFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">IGV (18%) <InfoTooltip text={TOOLTIPS.igv} /></span>
                        <span>{formatCurrency(simulation.igvAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 dark:border-white/[0.06] pt-1.5 font-medium text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">TCEA <InfoTooltip text={TOOLTIPS.tcea} /></span>
                        <span>{simulation.tceaPercent}% anual</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
                    Ingresa un monto para ver el desglose
                  </p>
                )}

                <button
                  type="submit"
                  disabled={form.formState.isSubmitting || !simulation || kycApproved === null}
                  className="w-full mt-6 bg-[#D4AF37] text-[#0A192F] font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  {form.formState.isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando solicitud...</>
                    : <><i className="fa-solid fa-paper-plane" />Solicitar préstamo ahora</>}
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                  <i className="fa-solid fa-shield-halved mr-1" />
                  Datos cifrados · Regulado por SBS · Ley N° 29733
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
