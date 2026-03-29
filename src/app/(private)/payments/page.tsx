'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { loanRepository, useLoanStore } from '@/features/request-loan'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Loan, LoanBalance, Payment } from '@/entities/loan'

const ACTIVE_STATUSES = ['APPROVED', 'SIGNED', 'ACTIVE', 'OVERDUE']

type AmountType = 'full' | 'custom'
type MethodId = 'card' | 'transfer' | 'yape' | 'plin' | 'bbva'

const PAYMENT_METHODS: { id: MethodId; logo: React.ReactNode; label: string; desc: string }[] = [
  {
    id: 'card',
    logo: <i className="fa-brands fa-cc-visa text-blue-600 dark:text-blue-400 text-2xl" />,
    label: 'Tarjeta Débito / Crédito',
    desc: 'Pago seguro con tarjeta',
  },
  {
    id: 'transfer',
    logo: <i className="fa-solid fa-building-columns text-white text-sm" />,
    label: 'Transferencia CCI (BCP/Interbank)',
    desc: 'Generar código para pago',
  },
  {
    id: 'yape',
    logo: <span className="text-white font-bold text-xs">Yape</span>,
    label: 'Yape',
    desc: 'Pago instantáneo desde la app',
  },
  {
    id: 'plin',
    logo: <span className="text-white font-bold text-xs">Plin</span>,
    label: 'Plin',
    desc: 'Pago rápido con tu celular',
  },
  {
    id: 'bbva',
    logo: <span className="text-white font-bold text-[10px]">BBVA</span>,
    label: 'BBVA Perú',
    desc: 'Transferencia directa desde BBVA',
  },
]

const METHOD_LOGO_BG: Record<MethodId, string> = {
  card: 'bg-gray-100 dark:bg-[#334155]',
  transfer: 'bg-[#0A192F] dark:bg-[#0A192F]',
  yape: 'bg-purple-600',
  plin: 'bg-cyan-500',
  bbva: 'bg-blue-900',
}

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

export default function PaymentsPage() {
  const { loans, isLoading, loadMyLoans } = useLoanStore()

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [amountType, setAmountType] = useState<AmountType>('full')
  const [customAmount, setCustomAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<MethodId>('card')
  const [balance, setBalance] = useState<LoanBalance | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<Payment | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadMyLoans() }, [loadMyLoans])

  const activeLoans = loans.filter(l => ACTIVE_STATUSES.includes(l.status))

  const loadLoanData = useCallback(async (loanId: string) => {
    try {
      const [bal, pays] = await Promise.all([
        loanRepository.getLoanBalance(loanId),
        loanRepository.getLoanPayments(loanId),
      ])
      setBalance(bal)
      setPayments(pays)
    } catch {
      setBalance(null)
      setPayments([])
    }
  }, [])

  useEffect(() => {
    if (activeLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(activeLoans[0].id)
    }
  }, [activeLoans, selectedLoanId])

  useEffect(() => {
    if (selectedLoanId) loadLoanData(selectedLoanId)
  }, [selectedLoanId, loadLoanData])

  const selectedLoan = loans.find(l => l.id === selectedLoanId) ?? null

  const paymentAmount = amountType === 'full'
    ? (selectedLoan?.installmentAmount ?? 0)
    : parseFloat(customAmount) || 0

  const handleSubmit = async () => {
    if (!selectedLoanId || paymentAmount <= 0) return
    setIsSubmitting(true)
    setError(null)
    try {
      let result: Payment
      if (amountType === 'full') {
        // TODO: for 'card' method, integrate Culqi to get a token first, then use loanRepository.chargeCard
        result = await loanRepository.payLoan(selectedLoanId, {
          amount: paymentAmount,
          method: selectedMethod.toUpperCase(),
        })
      } else {
        result = await loanRepository.partialPayment(selectedLoanId, {
          amount: paymentAmount,
          method: selectedMethod.toUpperCase(),
        })
      }
      setSuccess(result)
      await loadLoanData(selectedLoanId)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Ocurrió un error al procesar el pago. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A192F] dark:text-white mb-1">Pagos</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Realiza pagos y consulta tu historial de transacciones.
          </p>
        </div>
        <Link
          href="/notifications"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
        >
          <i className="fa-regular fa-bell" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left column (steps) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1 – Select loan */}
          <section className={`${cardCls} p-6`}>
            <h2 className="text-base font-semibold text-[#0A192F] dark:text-white flex items-center gap-2 mb-5">
              <span className="w-6 h-6 rounded-full bg-[#0A192F]/10 dark:bg-[#D4AF37]/20 text-[#0A192F] dark:text-[#D4AF37] flex items-center justify-center text-xs font-semibold shrink-0">1</span>
              Seleccionar Préstamo
            </h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-[#334155] animate-pulse" />)}
              </div>
            ) : activeLoans.length === 0 ? (
              <div className="text-center py-8">
                <i className="fa-regular fa-folder-open text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No tienes préstamos activos para pagar.</p>
                <Link href="/request-loan" className="mt-4 inline-block text-sm font-medium text-[#0A192F] dark:text-[#D4AF37] underline">
                  Solicitar un préstamo
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLoans.map((loan: Loan) => (
                  <label key={loan.id} className="cursor-pointer block">
                    <input
                      type="radio"
                      name="loan-selection"
                      className="sr-only peer"
                      checked={selectedLoanId === loan.id}
                      onChange={() => {
                        setSelectedLoanId(loan.id)
                        setAmountType('full')
                        setCustomAmount('')
                      }}
                    />
                    <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between
                      ${selectedLoanId === loan.id
                        ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/5'
                        : 'border-gray-100 dark:border-white/6 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155]/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-bolt" />
                        </div>
                        <div>
                          <h4 className="text-[#0A192F] dark:text-white font-medium">Préstamo Solvo</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ref: #{loan.id.substring(0, 12).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Cuota actual</p>
                          <p className="text-[#0A192F] dark:text-white font-bold">
                            {formatCurrency(loan.installmentAmount)}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${selectedLoanId === loan.id
                            ? 'border-[#0A192F] dark:border-[#D4AF37]'
                            : 'border-gray-300 dark:border-gray-500'
                          }`}
                        >
                          {selectedLoanId === loan.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Step 2 – Amount */}
          <section className={`${cardCls} p-6`}>
            <h2 className="text-base font-semibold text-[#0A192F] dark:text-white flex items-center gap-2 mb-5">
              <span className="w-6 h-6 rounded-full bg-[#0A192F]/10 dark:bg-[#D4AF37]/20 text-[#0A192F] dark:text-[#D4AF37] flex items-center justify-center text-xs font-semibold shrink-0">2</span>
              Monto a Pagar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Full installment */}
              <label className="cursor-pointer block">
                <input
                  type="radio"
                  name="amount-type"
                  className="sr-only peer"
                  checked={amountType === 'full'}
                  onChange={() => setAmountType('full')}
                />
                <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between
                  ${amountType === 'full'
                    ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/5'
                    : 'border-gray-100 dark:border-white/6 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155]/30'
                  }`}
                >
                  <div>
                    <h4 className="text-[#0A192F] dark:text-white font-medium">Pago Total de Cuota</h4>
                    <p className="text-xl font-bold text-[#0A192F] dark:text-[#D4AF37] mt-1">
                      {selectedLoan ? formatCurrency(selectedLoan.installmentAmount) : '—'}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${amountType === 'full' ? 'border-[#0A192F] dark:border-[#D4AF37]' : 'border-gray-300 dark:border-gray-500'}`}
                  >
                    {amountType === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />}
                  </div>
                </div>
              </label>

              {/* Custom amount */}
              <label className="cursor-pointer block">
                <input
                  type="radio"
                  name="amount-type"
                  className="sr-only peer"
                  checked={amountType === 'custom'}
                  onChange={() => setAmountType('custom')}
                />
                <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between
                  ${amountType === 'custom'
                    ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/5'
                    : 'border-gray-100 dark:border-white/6 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155]/30'
                  }`}
                >
                  <div>
                    <h4 className="text-[#0A192F] dark:text-white font-medium">Otro Monto</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pago parcial o adelantado</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                    ${amountType === 'custom' ? 'border-[#0A192F] dark:border-[#D4AF37]' : 'border-gray-300 dark:border-gray-500'}`}
                  >
                    {amountType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />}
                  </div>
                </div>
              </label>
            </div>

            {/* Custom amount input */}
            {amountType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ingresa el monto a pagar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold">S/</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-full bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-white/6 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#0A192F] dark:focus:border-[#D4AF37] transition-colors text-lg"
                  />
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2 flex items-center gap-1">
                  <i className="fa-solid fa-triangle-exclamation" />
                  El monto mínimo aceptado es de S/ 50.00
                </p>
              </div>
            )}
          </section>

          {/* Step 3 – Payment method */}
          <section className={`${cardCls} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#0A192F] dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0A192F]/10 dark:bg-[#D4AF37]/20 text-[#0A192F] dark:text-[#D4AF37] flex items-center justify-center text-xs font-semibold shrink-0">3</span>
                Método de Pago
              </h2>
              {/* TODO: implement "add new card" flow */}
              <button className="text-[#0A192F] dark:text-[#D4AF37] text-sm font-medium hover:underline transition-colors">
                Agregar nuevo
              </button>
            </div>

            <div className="space-y-3">
              {PAYMENT_METHODS.map(method => (
                <label key={method.id} className="cursor-pointer block">
                  <input
                    type="radio"
                    name="payment-method"
                    className="sr-only peer"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between
                    ${selectedMethod === method.id
                      ? 'border-[#0A192F] dark:border-[#D4AF37] bg-[#0A192F]/5 dark:bg-[#D4AF37]/5'
                      : 'border-gray-100 dark:border-white/6 bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-[#334155]/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-8 rounded flex items-center justify-center ${METHOD_LOGO_BG[method.id]}`}>
                        {method.logo}
                      </div>
                      <div>
                        <h4 className="text-[#0A192F] dark:text-white font-medium">{method.label}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{method.desc}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${selectedMethod === method.id ? 'border-[#0A192F] dark:border-[#D4AF37]' : 'border-gray-300 dark:border-gray-500'}`}
                    >
                      {selectedMethod === method.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0A192F] dark:bg-[#D4AF37]" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Payment summary */}
          <section className={`${cardCls} p-6`}>
            <h3 className="text-lg font-bold text-[#0A192F] dark:text-white mb-6 border-b border-gray-100 dark:border-white/6 pb-4">
              Resumen de Pago
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Préstamo</span>
                <span className="text-[#0A192F] dark:text-white font-medium text-right">
                  {selectedLoan ? (
                    <>Préstamo Solvo<br /><span className="text-xs text-gray-400">#{selectedLoan.id.substring(0, 12).toUpperCase()}</span></>
                  ) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Saldo pendiente</span>
                <span className="text-[#0A192F] dark:text-white font-medium">
                  {balance ? formatCurrency(balance.remaining) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="text-[#0A192F] dark:text-white font-medium">
                  {paymentAmount > 0 ? formatCurrency(paymentAmount) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">IGV (18%)</span>
                <span className="text-[#0A192F] dark:text-white font-medium">S/ 0.00</span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-white/6 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[#0A192F] dark:text-white font-bold">Total a Pagar</span>
                <span className="text-2xl font-bold text-[#0A192F] dark:text-[#D4AF37]">
                  {paymentAmount > 0 ? formatCurrency(paymentAmount) : '—'}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedLoanId || paymentAmount <= 0}
              className="w-full bg-[#0A192F] hover:bg-[#0A192F]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl flex justify-center items-center gap-2 mb-4 font-medium transition-all"
            >
              {isSubmitting ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> Procesando...</>
              ) : (
                <><i className="fa-solid fa-lock" /> Confirmar Pago</>
              )}
            </button>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
              <i className="fa-solid fa-shield-halved" />
              Protegido por SBS - Cifrado 256-bit
            </p>
          </section>

          {/* Recent payments */}
          <section className={`${cardCls} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0A192F] dark:text-white">Últimos Pagos</h3>
              {selectedLoanId && (
                <Link
                  href={`/loans/${selectedLoanId}`}
                  className="text-[#0A192F] dark:text-[#D4AF37] hover:underline text-sm transition-colors"
                >
                  Ver todos
                </Link>
              )}
            </div>

            {payments.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                {selectedLoanId ? 'Sin pagos registrados aún.' : 'Selecciona un préstamo para ver el historial.'}
              </p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map(payment => {
                  const isOk = payment.status === 'COMPLETED' || payment.status === 'PAID'
                  const isFailed = payment.status === 'FAILED'
                  return (
                    <div
                      key={payment.id}
                      className={`flex items-center justify-between p-3 rounded-xl border
                        ${isFailed
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'
                          : 'bg-gray-50 dark:bg-[#0F172A] border-gray-100 dark:border-white/6'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${isFailed
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          }`}
                        >
                          <i className={`fa-solid ${isFailed ? 'fa-xmark' : 'fa-check'}`} />
                        </div>
                        <div>
                          <p className="text-[#0A192F] dark:text-white font-medium text-sm">
                            {isFailed ? 'Pago Fallido' : 'Pago Exitoso'}
                          </p>
                          <p className={`text-xs ${isFailed ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isFailed ? 'Error al procesar' : formatDate(payment.paidAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#0A192F] dark:text-white font-bold text-sm">
                          {formatCurrency(payment.amount)}
                        </p>
                        {isOk && (
                          <button className="text-xs text-[#0A192F] dark:text-[#D4AF37] hover:underline flex items-center gap-1 justify-end mt-1">
                            <i className="fa-solid fa-download" /> Recibo
                          </button>
                        )}
                        {isFailed && (
                          <button className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded mt-1 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
                            Reintentar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${cardCls} max-w-md w-full p-8 text-center relative`}>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Éxito"
            >
              <i className="fa-solid fa-xmark text-xl" />
            </button>

            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-6 text-4xl border-2 border-green-200 dark:border-green-800/50">
              <i className="fa-solid fa-check" />
            </div>

            <h2 className="text-2xl font-bold text-[#0A192F] dark:text-white mb-2">¡Pago Exitoso!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Tu pago ha sido procesado correctamente y aplicado a tu préstamo.
            </p>

            <div className="bg-gray-50 dark:bg-[#0F172A] rounded-xl p-4 mb-8 text-left space-y-2 border border-gray-100 dark:border-white/6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Referencia:</span>
                <span className="text-[#0A192F] dark:text-white font-medium">#{success.id.substring(0, 12).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                <span className="text-[#0A192F] dark:text-white font-medium">{formatDate(success.paidAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                <span className="text-[#0A192F] dark:text-[#D4AF37] font-bold">{formatCurrency(success.amount)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="w-full bg-[#0A192F] text-white py-3 rounded-xl text-center font-medium hover:bg-[#0A192F]/90 transition-colors"
              >
                Ir al Dashboard
              </Link>
              <button className="w-full bg-transparent border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors flex justify-center items-center gap-2 font-medium">
                <i className="fa-solid fa-download" /> Descargar Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
