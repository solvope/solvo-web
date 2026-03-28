'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileSignature, CreditCard, Download, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLoanStore, loanRepository } from '@/features/request-loan'
import { canSign, isActiveLoan, canPay, LoanStatusBadge } from '@/entities/loan'
import type { InstallmentStatus } from '@/entities/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { formatCurrency, formatDate, formatDateTime } from '@/shared/lib/utils'

const INSTALLMENT_STATUS_CONFIG: Record<InstallmentStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  PAID:         { label: 'Pagada',         icon: CheckCircle2, className: 'text-green-600' },
  PENDING:      { label: 'Pendiente',      icon: Clock,        className: 'text-muted-foreground' },
  OVERDUE:      { label: 'Vencida',        icon: AlertCircle,  className: 'text-destructive' },
  RESTRUCTURED: { label: 'Reestructurada', icon: RefreshCw,    className: 'text-purple-600' },
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  const activeInstallments = installments.filter(i => i.status !== 'RESTRUCTURED')

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/loans"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Detalle del préstamo</h1>
          <p className="text-xs text-muted-foreground">ID: {loan.id}</p>
        </div>
        <LoanStatusBadge status={loan.status} />
      </div>

      <Card>
        <CardHeader><CardTitle>Información general</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-semibold">{formatCurrency(loan.amount)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Plazo</span><span>{loan.termDays} días</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Solicitado</span><span>{formatDate(loan.createdAt)}</span></div>
          {loan.dueDate && (
            <div className="flex justify-between"><span className="text-muted-foreground">Fecha de vencimiento</span><span>{formatDate(loan.dueDate)}</span></div>
          )}
        </CardContent>
      </Card>

      {balance && (
        <Card>
          <CardHeader><CardTitle>Saldo</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total a pagar</span><span className="font-semibold">{formatCurrency(balance.totalAmount)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Pagado</span><span className="text-green-600">{formatCurrency(balance.totalPaid)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pendiente</span><span className="font-bold text-primary">{formatCurrency(balance.remaining)}</span></div>
          </CardContent>
        </Card>
      )}

      {activeInstallments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Cronograma de cuotas</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="px-4 py-2">Cuota</th>
                  <th className="px-4 py-2">Vencimiento</th>
                  <th className="px-4 py-2 text-right">Capital</th>
                  <th className="px-4 py-2 text-right">Interés</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {activeInstallments.map(inst => {
                  const cfg = INSTALLMENT_STATUS_CONFIG[inst.status]
                  const Icon = cfg.icon
                  const pendingAmount = inst.amount - inst.paidAmount
                  return (
                    <tr key={inst.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">#{inst.installmentNumber}</td>
                      <td className="px-4 py-3">{formatDate(inst.dueDate)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(inst.principal)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(inst.interest)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(inst.amount)}
                        {inst.paidAmount > 0 && inst.paidAmount < inst.amount && (
                          <span className="block text-xs text-muted-foreground">
                            Pendiente: {formatCurrency(pendingAmount)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.className}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {canSign(loan) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Firma el contrato</p>
              <p className="text-sm text-muted-foreground">Tu préstamo fue aprobado. Firma para recibir el dinero.</p>
            </div>
            <Button onClick={handleSign} className="gap-2 shrink-0">
              <FileSignature className="h-4 w-4" /> Firmar
            </Button>
          </CardContent>
        </Card>
      )}

      {loan.contractUrl && (
        <Button variant="outline" className="w-full gap-2" onClick={handleDownloadContract}>
          <Download className="h-4 w-4" /> Descargar contrato
        </Button>
      )}

      {(isActiveLoan(loan) || canPay(loan)) && (
        <Button asChild className="w-full gap-2">
          <Link href={`/loans/${loan.id}/pay`}>
            <CreditCard className="h-4 w-4" /> Realizar pago
          </Link>
        </Button>
      )}

      {payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historial de pagos</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Método</th>
                  <th className="pb-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">{formatDateTime(p.paidAt)}</td>
                    <td className="py-2 capitalize">{p.method.toLowerCase().replace('_', ' ')}</td>
                    <td className="py-2 text-right text-green-600 font-medium">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
