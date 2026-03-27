'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Info, TrendingDown, CalendarDays, Wallet, Receipt } from 'lucide-react'
import { simulate, type SimulationResult, type LoanProductType, type PaymentFrequency } from '../api/simulatorRepository'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

// ─── Config ─────────────────────────────────────────────────────────────────

const PRODUCTS: { value: LoanProductType; label: string; desc: string }[] = [
  { value: 'EXPRESS', label: 'Solvo Express', desc: '1 cuota' },
  { value: 'FLEX', label: 'Solvo Flex', desc: '2 cuotas' },
]

const FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: 'MENSUAL', label: 'Mensual (30 días)' },
  { value: 'QUINCENAL', label: 'Quincenal (15 días)' },
]

const MIN_AMOUNT = 100
const MAX_AMOUNT = 500
const STEP = 25

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(n)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoanSimulator() {
  const [amount, setAmount] = useState(200)
  const [product, setProduct] = useState<LoanProductType>('EXPRESS')
  const [frequency, setFrequency] = useState<PaymentFrequency>('MENSUAL')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSimulation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await simulate({ amount, productType: product, paymentFrequency: frequency })
      setResult(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al calcular'
      setError(msg)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [amount, product, frequency])

  // Debounce: recalcular 500ms después del último cambio
  useEffect(() => {
    const timer = setTimeout(runSimulation, 500)
    return () => clearTimeout(timer)
  }, [runSimulation])

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Controles */}
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
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={STEP}
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
                  className={`rounded-lg border p-3 text-left transition-colors ${product === p.value
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
                  className={`rounded-lg border p-3 text-sm font-medium transition-colors ${frequency === f.value
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

      {/* Resultado */}
      {loading && (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && !loading && (
        <>
          {/* Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen de tu simulación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cuota destacada */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {result.numInstallments === 1 ? 'Pago único' : `Cuota ${frequency === 'MENSUAL' ? 'mensual' : 'quincenal'}`}
                </p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(result.installmentAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.numInstallments > 1 ? `× ${result.numInstallments} cuotas` : `en ${result.termDays} días`}
                </p>
              </div>

              {/* Items detalle */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-4 w-4" /> Monto solicitado
                  </span>
                  <span className="font-medium">{formatCurrency(result.amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="h-4 w-4" /> Comisión de desembolso
                  </span>
                  <span className="font-medium text-orange-600">− {formatCurrency(result.commission)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <TrendingDown className="h-4 w-4" /> Monto que recibes
                  </span>
                  <span className="font-semibold text-green-600">{formatCurrency(result.netDisbursed)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" /> Interés total
                  </span>
                  <span className="font-medium">{formatCurrency(result.totalInterest)}</span>
                </div>
                <div className="flex justify-between py-2 border-b font-semibold">
                  <span>Total a devolver</span>
                  <span>{formatCurrency(result.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2 text-xs text-muted-foreground">
                  <span>TEA</span>
                  <span>{result.teaPercent.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-2 text-xs text-muted-foreground">
                  <span>TCEA</span>
                  <span>{result.tceaPercent.toFixed(2)}%</span>
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
                        <span>{new Date(row.dueDate + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
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
              Esta simulación está basada en el <strong>perfil excelente (TIER_A, TEA {result.teaPercent.toFixed(0)}%)</strong>.
              Los valores reales de tu préstamo se calcularán con tu perfil crediticio una vez completadas
              las validaciones de identidad y score, y serán detallados en tu propuesta oficial.
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
