'use client'
import { useEffect } from 'react'
import { useLoanStore } from '@/features/request-loan'
import { LoanCard } from '@/widgets/loan-card'
import { Skeleton } from '@/shared/ui/skeleton'

export default function LoansPage() {
  const { loans, isLoading, loadMyLoans } = useLoanStore()

  useEffect(() => { loadMyLoans() }, [loadMyLoans])

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Mis préstamos</h1>
        <p className="text-muted-foreground text-sm">Historial completo de tus solicitudes</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : loans.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground">No tienes préstamos registrados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map(loan => <LoanCard key={loan.id} loan={loan} />)}
        </div>
      )}
    </div>
  )
}
