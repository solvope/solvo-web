'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLoanStore, loanRepository } from '@/features/request-loan'
import { canSign, isActiveLoan, canPay, LoanStatusBadge } from '@/entities/loan'
import type { InstallmentStatus } from '@/entities/loan'
import { formatCurrency, formatDate, formatDateTime } from '@/shared/lib/utils'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

const INSTALLMENT_STATUS_CONFIG: Record<InstallmentStatus, { label: string; icon: typeof CheckCircle2; badge: string }> = {
  PAID: { label: 'Pagada', icon: CheckCircle2, badge: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
  PENDING: { label: 'Pendiente', icon: Clock, badge: 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400' },
  OVERDUE: { label: 'Vencida', icon: AlertCircle, badge: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  RESTRUCTURED: { label: 'Reestructurada', icon: RefreshCw, badge: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
}

export default function LoanDetailPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const { selectedLoan: loan, balance, payments, installments, isLoading, loadLoanDetails, signLoan } = useLoanStore()

  useEffect(() => { loadLoanDetails(loanId) }, [loanId, loadLoanDetails])

  const handleDownloadContract = async () => {
    try {
      const url = await loanRepository.getContractUrl(loanId)
      window.open(url, '_blank')
    } catch {
      toast.error('No se pudo obtener el contrato. Inténtalo de nuevo.')
    }
  }

  const handleSign = async () => {
    try {
      await signLoan(loanId)
      toast.success('¡Contrato firmado! Recibirás el dinero en breve.')
      loadLoanDetails(loanId)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al firmar')
    }
  }

  if (isLoading || !loan) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-[#334155] rounded-xl animate-pulse" />
        <div className={`${cardCls} h-44 animate-pulse`} />
        <div className={`${cardCls} h-64 animate-pulse`} />
      </div>
    )
  }

  const activeInstallments = installments.filter(i => i.status !== 'RESTRUCTURED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/loans"
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors "
        >
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F] dark:text-white">Detalle del préstamo</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">ID: {loan.id}</p>
        </div>
        <div className="ml-auto">
          <LoanStatusBadge status={loan.status} />
        </div>
      </div>

      {/* Sign contract banner */}
      {canSign(loan) && (
        <div className={`${cardCls} p-5 border-l-2 border-l-[#D4AF37] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
              <i className="fa-solid fa-file-signature text-xl" />
            </div>
            <div>
              <p className="font-semibold text-[#0A192F] dark:text-white">Firma el contrato</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tu préstamo fue aprobado. Firma para recibir el dinero.</p>
            </div>
          </div>
          <button
            onClick={handleSign}
            className="bg-[#D4AF37] text-[#0A192F] font-medium px-6 py-2.5 rounded-xl text-sm hover:bg-[#B8941F] transition-colors shrink-0"
          >
            <i className="fa-solid fa-signature mr-2" />
            Firmar contrato
          </button>
        </div>
      )}

      {/* Loan info + balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General info */}
        <div className={`${cardCls} p-6`}>
          <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white mb-5">Información General</h2>
          <div className="space-y-4">
            {[
              { label: 'Monto solicitado', value: formatCurrency(loan.amount), highlight: true },
              { label: 'Plazo', value: `${loan.termDays} días` },
              { label: 'Fecha de solicitud', value: formatDate(loan.createdAt) },
              ...(loan.dueDate ? [{ label: 'Fecha de vencimiento', value: formatDate(loan.dueDate) }] : []),
            ].map((item, i, arr) => (
              <div key={item.label} className={`flex justify-between items-center ${i < arr.length - 1 ? 'pb-4 border-b border-gray-100 dark:border-white/6' : ''}`}>
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className={`text-sm font-semibold ${item.highlight ? 'text-[#0A192F] dark:text-[#D4AF37] text-base' : 'text-gray-800 dark:text-gray-200'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Balance */}
        {balance && (
          <div className={`${cardCls} p-6`}>
            <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white mb-5">Saldo</h2>
            <div className="space-y-4">
              {[
                { label: 'Total a pagar', value: formatCurrency(balance.totalAmount) },
                { label: 'Total pagado', value: formatCurrency(balance.totalPaid), green: true },
              ].map((item, i) => (
                <div key={item.label} className={`flex justify-between items-center ${i === 0 ? 'pb-4 border-b border-gray-100 dark:border-white/6' : ''}`}>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.green ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
              {/* Remaining balance hero */}
              <div className="mt-2 p-4 rounded-lg bg-linear-to-br from-[#0A192F] to-[#1A365D] text-white flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Saldo pendiente</span>
                <span className="text-2xl font-bold">{formatCurrency(balance.remaining)}</span>
              </div>
              {balance.dueDate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Vence el {new Date(balance.dueDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              {balance.isOverdue && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                  <i className="fa-solid fa-triangle-exclamation" />
                  Este préstamo está vencido
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {(isActiveLoan(loan) || canPay(loan)) && (
          <Link
            href={`/loans/${loan.id}/pay`}
            className="flex-1 bg-[#D4AF37] text-[#0A192F] font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#B8941F] transition-colors"
          >
            <i className="fa-solid fa-credit-card" />
            Realizar Pago
          </Link>
        )}
        {loan.contractUrl && (
          <button
            onClick={handleDownloadContract}
            className="flex-1 bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-gray-200 font-medium py-3.5 px-6 rounded-xl border border-gray-100 dark:border-white/6 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors"
          >
            <i className="fa-solid fa-download" />
            Descargar Contrato
          </button>
        )}
      </div>

      {/* Installments schedule */}
      {activeInstallments.length > 0 && (
        <div className={`${cardCls} p-6`}>
          <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white mb-5">Cronograma de Cuotas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/6">
                  <th className="pb-3 px-2 font-medium">Cuota</th>
                  <th className="pb-3 px-2 font-medium">Vencimiento</th>
                  <th className="pb-3 px-2 text-right font-medium">Capital</th>
                  <th className="pb-3 px-2 text-right font-medium">Interés</th>
                  <th className="pb-3 px-2 text-right font-medium">Total</th>
                  <th className="pb-3 px-2 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {activeInstallments.map(inst => {
                  const cfg = INSTALLMENT_STATUS_CONFIG[inst.status]
                  const Icon = cfg.icon
                  const pendingAmount = inst.amount - inst.paidAmount
                  return (
                    <tr key={inst.id} className="border-b border-gray-100 dark:border-white/6 last:border-0 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors">
                      <td className="py-3.5 px-2 font-semibold text-[#0A192F] dark:text-white">#{inst.installmentNumber}</td>
                      <td className="py-3.5 px-2 text-gray-600 dark:text-gray-300">{formatDate(inst.dueDate)}</td>
                      <td className="py-3.5 px-2 text-right text-gray-600 dark:text-gray-300">{formatCurrency(inst.principal)}</td>
                      <td className="py-3.5 px-2 text-right text-gray-600 dark:text-gray-300">{formatCurrency(inst.interest)}</td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="font-semibold text-[#0A192F] dark:text-white">{formatCurrency(inst.amount)}</span>
                        {inst.paidAmount > 0 && inst.paidAmount < inst.amount && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Pendiente: {formatCurrency(pendingAmount)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <div className={`${cardCls} p-6`}>
          <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white mb-5">Historial de Pagos</h2>
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#334155]">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-arrow-down text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0A192F] dark:text-white text-sm">Pago Registrado</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {p.method.toLowerCase().replace('_', ' ')} · {formatDateTime(p.paidAt)}
                    </p>
                  </div>
                </div>
                <p className="text-green-600 dark:text-green-400 font-semibold">
                  +{formatCurrency(p.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
