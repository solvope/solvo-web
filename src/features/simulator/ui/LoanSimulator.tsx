'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Info, ArrowDown, Wallet, Cpu, Zap, Settings } from 'lucide-react'
import { simulate, type SimulationResult, type LoanProductType, type PaymentFrequency } from '../api/simulatorRepository'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { InfoTooltip } from '@/shared/ui/info-tooltip'
import { Button } from '@/shared/ui/button'

// ─── Config ─────────────────────────────────────────────────────────────────

const PRODUCTS: { value: LoanProductType; label: string; desc: string }[] = [
  { value: 'EXPRESS', label: 'Solvo Express', desc: '1 cuota' },
  { value: 'FLEX',    label: 'Solvo Flex',    desc: '2 cuotas' },
]

const FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: 'MENSUAL',   label: 'Mensual (30 días)' },
  { value: 'QUINCENAL', label: 'Quincenal (15 días)' },
]

const TOOLTIPS = {
  techFee:         'Cubre los costos de la plataforma digital, verificación de identidad y procesamiento de tu solicitud.',
  disbursementFee: 'Cubre la transferencia del dinero a tu cuenta. Se descuenta del monto que recibes.',
  maintenanceFee:  'Cubre la administración de tu cuenta durante la vigencia del préstamo. Se cobra por cada cuota.',
  igv:             'Impuesto General a las Ventas (18%) aplicado sobre las comisiones. Los intereses están exonerados de IGV según Ley N° 28194.',
  tcea:            'Tasa de Costo Efectivo Anual. Refleja el costo total incluyendo intereses y comisiones.',
}

const MIN_AMOUNT = 200
const MAX_AMOUNT = 500
const STEP = 25

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(n)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoanSimulator() {
  const [amount, setAmount]       = useState(200)
  const [product, setProduct]     = useState<LoanProductType>('EXPRESS')
  const [frequency, setFrequency] = useState<PaymentFrequency>('MENSUAL')
  const [result, setResult]       = useState<SimulationResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const runSimulation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await simulate({ amount, productType: product, paymentFrequency: frequency })
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al calcular')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [amount, product, frequency])

  useEffect(() => {
    const timer = setTimeout(runSimulation, 500)
    return () => clearTimeout(timer)
  }, [runSimulation])

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* ── Controles ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configura tu préstamo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Monto */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">Monto solicitado</label>
              <span className="text-2xl font-bold text-primary">{formatCurrency(amount)}</span>
            </div>
            <input
              type="range"
              min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatCurrency(MIN_AMOUNT)}</span>
              <span>{formatCurrency(MAX_AMOUNT)}</span>
            </div>
          </div>

          {/* Producto */}
          <div>
            <label className="text-sm font-medium block mb-2">Producto</label>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCTS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProduct(p.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    product === p.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="text-sm font-medium block mb-2">Frecuencia de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                    frequency === f.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Loader ────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Resultado ─────────────────────────────────────────────────────── */}
      {result && !loading && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen de tu simulación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Cuota destacada */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {result.numInstallments === 1
                    ? 'Pago único'
                    : `Cuota ${frequency === 'MENSUAL' ? 'mensual' : 'quincenal'}`}
                </p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(result.installmentAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.numInstallments > 1
                    ? `× ${result.numInstallments} cuotas`
                    : `en ${result.termDays} días`}
                </p>
              </div>

              {/* Desglose — cuotas */}
              <div className="space-y-0 text-sm divide-y divide-border/40">

                <div className="flex justify-between py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-4 w-4 shrink-0" /> Monto solicitado
                  </span>
                  <span className="font-medium">{formatCurrency(result.amount)}</span>
                </div>

                <div className="flex justify-between py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <ArrowDown className="h-4 w-4 shrink-0" /> Interés (TEA {result.teaPercent.toFixed(0)}%)
                  </span>
                  <span className="font-medium">{formatCurrency(result.totalInterest)}</span>
                </div>

                <div className="flex justify-between py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-4 w-4 shrink-0" />
                    Com. mantenimiento
                    <InfoTooltip text={TOOLTIPS.maintenanceFee} />
                  </span>
                  <span className="font-medium">
                    {formatCurrency(result.maintenanceFeeTotal)}
                    {result.numInstallments > 1 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({formatCurrency(result.maintenanceFee)} × {result.numInstallments})
                      </span>
                    )}
                  </span>
                </div>

                {/* Total a devolver = suma exacta de cuotas */}
                <div className="flex justify-between py-2.5 font-semibold text-base">
                  <span>Total a devolver</span>
                  <span className="text-primary">{formatCurrency(result.totalAmount)}</span>
                </div>

                {/* Monto que recibes */}
                <div className="flex justify-between py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 shrink-0" />
                    Com. desembolso
                    <InfoTooltip text={TOOLTIPS.disbursementFee} />
                  </span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    − {formatCurrency(result.disbursementFee)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 rounded-lg bg-emerald-500/5 px-2 -mx-2">
                  <span className="font-semibold text-sm">Recibes en tu cuenta</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(result.netDisbursed)}
                  </span>
                </div>
              </div>

              {/* Comisiones distribuidas en cuotas */}
              <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 space-y-1.5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground/70 uppercase tracking-wide text-[10px] mb-1">
                  Comisiones distribuidas en cuotas
                </p>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> Com. tecnología
                    <InfoTooltip text={TOOLTIPS.techFee} />
                  </span>
                  <span>{formatCurrency(result.techFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    IGV (18%) sobre comisiones
                    <InfoTooltip text={TOOLTIPS.igv} />
                  </span>
                  <span>{formatCurrency(result.igvAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border/30 pt-1.5 font-medium text-foreground/80">
                  <span className="flex items-center gap-1">
                    TCEA
                    <InfoTooltip text={TOOLTIPS.tcea} />
                  </span>
                  <span>{result.tceaPercent.toFixed(2)}% anual</span>
                </div>
              </div>

              {/* Cronograma */}
              {result.schedule.length > 1 && (
                <div>
                  <p className="text-sm font-medium mb-2">Cronograma de cuotas</p>
                  <div className="rounded-lg border overflow-hidden text-xs">
                    <div className="grid grid-cols-4 bg-muted px-3 py-2 font-medium text-muted-foreground">
                      <span>Cuota</span>
                      <span>Vence</span>
                      <span className="text-right">Capital</span>
                      <span className="text-right">Total</span>
                    </div>
                    {result.schedule.map((row) => (
                      <div key={row.installmentNumber} className="grid grid-cols-4 px-3 py-2 border-t">
                        <span>#{row.installmentNumber}</span>
                        <span>
                          {new Date(row.dueDate + 'T00:00:00').toLocaleDateString('es-PE', {
                            day: '2-digit', month: 'short',
                          })}
                        </span>
                        <span className="text-right">{formatCurrency(row.principal)}</span>
                        <span className="text-right font-medium">{formatCurrency(row.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Simulación basada en el <strong>perfil excelente (TIER_A, TEA {result.teaPercent.toFixed(0)}%)</strong>.
              Los valores reales se calcularán con tu perfil crediticio y serán detallados en tu propuesta oficial.
            </p>
          </div>

          <Button asChild size="lg" className="w-full">
            <a href="/register">Solicitar este préstamo</a>
          </Button>
        </>
      )}
    </div>
  )
}
