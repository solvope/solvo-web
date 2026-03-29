'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Zap, TrendingUp, Info } from 'lucide-react'
import Link from 'next/link'
import { simulate, type SimulationResult, type LoanProductType, type PaymentFrequency } from '../api/simulatorRepository'

// ─── Config ─────────────────────────────────────────────────────────────────

const MIN_AMOUNT = 200
const MAX_AMOUNT = 500
const STEP       = 25

function fmt(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoanSimulator() {
  const [amount,    setAmount]    = useState(200)
  const [product,   setProduct]   = useState<LoanProductType>('EXPRESS')
  const [frequency, setFrequency] = useState<PaymentFrequency>('MENSUAL')
  const [result,    setResult]    = useState<SimulationResult | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

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

  const numInstallments = product === 'EXPRESS' ? 1 : 2
  const freqLabel       = frequency === 'MENSUAL' ? 'mensual' : 'quincenal'
  const totalFees       = result
    ? result.techFee + result.maintenanceFeeTotal + result.igvAmount
    : null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* ── Controls ───────────────────────────────────────────────── */}
        <div className="space-y-8">

          {/* Producto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Producto
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setProduct('EXPRESS')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  product === 'EXPRESS'
                    ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#0A192F] dark:text-white'
                    : 'border-gray-200 dark:border-[#334155] text-gray-500 hover:border-[#00E5FF] hover:text-[#00E5FF]'
                }`}
              >
                <Zap className="h-4 w-4 text-[#00E5FF]" />
                Express
              </button>
              <button
                onClick={() => setProduct('FLEX')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  product === 'FLEX'
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0A192F] dark:text-white'
                    : 'border-gray-200 dark:border-[#334155] text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Flex
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                ¿Cuánto necesitas?
              </label>
              <span className="text-2xl font-bold text-[#0A192F] dark:text-white">
                S/ {fmt(amount)}
              </span>
            </div>
            <input
              type="range"
              min={MIN_AMOUNT} max={MAX_AMOUNT} step={STEP}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#0A192F] dark:accent-[#D4AF37]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>S/ {MIN_AMOUNT}</span>
              <span>S/ {MAX_AMOUNT}</span>
            </div>
          </div>

          {/* Frecuencia + Cuotas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Frecuencia
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PaymentFrequency)}
                className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-[#334155] text-gray-700 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
              >
                <option value="QUINCENAL">Quincenal</option>
                <option value="MENSUAL">Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Cuotas
              </label>
              <select
                disabled
                value={numInstallments}
                className="w-full bg-gray-100 dark:bg-[#0F172A] border border-gray-300 dark:border-[#334155] text-gray-700 dark:text-white rounded-xl px-4 py-3 opacity-70 cursor-not-allowed"
              >
                <option value={numInstallments}>
                  {numInstallments} cuota{numInstallments > 1 ? 's' : ''}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Summary Card (navy) ────────────────────────────────────── */}
        <div className="bg-linear-to-br from-[#0A192F] to-[#0A192F]/90 dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden border border-gray-700/30">

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#00E5FF]/20 to-transparent rounded-bl-full z-0" />

          <div className="relative z-10 flex-1">
            <h3 className="text-lg font-semibold text-gray-300 mb-6 border-b border-gray-700 pb-4">
              Resumen de tu préstamo
            </h3>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <p className="text-red-400 text-sm py-4">{error}</p>
            ) : result ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monto solicitado</span>
                    <span className="font-semibold">S/ {fmt(result.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Interés (TEA {result.teaPercent.toFixed(0)}%)</span>
                    <span className="font-semibold text-[#D4AF37]">S/ {fmt(result.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Comisiones e IGV</span>
                    <span className="font-semibold">S/ {fmt(totalFees!)}</span>
                  </div>
                  <div className="w-full h-px bg-gray-700 my-2" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">Total a devolver</span>
                    <span className="font-bold text-[#00E5FF]">S/ {fmt(result.totalAmount)}</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10 backdrop-blur-sm">
                  <div className="text-center">
                    <span className="block text-sm text-gray-300 mb-1">
                      Tu cuota {freqLabel} será de
                    </span>
                    <span className="text-3xl font-bold text-white">
                      S/ {fmt(result.installmentAmount)}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <Link
            href="/register"
            className="w-full py-3 bg-linear-to-r from-[#D4AF37] to-[#E5C158] text-[#0A192F] font-bold rounded-xl hover:opacity-90 transition-opacity relative z-10 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] text-center block mt-2"
          >
            Solicitar ahora
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-xs text-gray-500 text-center flex items-start justify-center gap-2">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p className="max-w-2xl">
          Simulación referencial. Los valores reales, incluyendo TEA y TCEA, se calcularán en base
          a tu perfil crediticio y serán detallados en tu propuesta oficial antes de aceptar el
          préstamo. Regulado por la SBS.
        </p>
      </div>
    </>
  )
}
