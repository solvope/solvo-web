'use client'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useLoanStore, RequestLoanModal } from '@/features/request-loan'
import { KycBanner } from '@/widgets/kyc-banner'
import { ActiveLoanBanner } from '@/widgets/active-loan-banner'
import { LoanCard } from '@/widgets/loan-card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { kycRepository } from '@/features/upload-kyc'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { loans, activeLoan, isLoading, loadMyLoans } = useLoanStore()
  const [showModal, setShowModal] = useState(false)
  const [kycApproved, setKycApproved] = useState(false)

  useEffect(() => {
    loadMyLoans()
    kycRepository.getStatus().then(s => setKycApproved(s.isIdentityVerified)).catch(() => { })
  }, [loadMyLoans])

  const recentLoans = loans.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {user?.firstName} 👋</h1>
          <p className="text-muted-foreground text-sm">Gestiona tus préstamos desde aquí</p>
        </div>
        {kycApproved && !activeLoan && (
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Solicitar
          </Button>
        )}
      </div>

      {!kycApproved && <KycBanner />}
      {activeLoan && <ActiveLoanBanner loan={activeLoan} />}

      <div>
        <h2 className="font-semibold mb-3">Mis préstamos recientes</h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : recentLoans.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">No tienes préstamos aún.</p>
            {kycApproved && (
              <Button onClick={() => setShowModal(true)} variant="outline" className="mt-3 gap-2">
                <Plus className="h-4 w-4" /> Solicitar tu primer préstamo
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentLoans.map(loan => <LoanCard key={loan.id} loan={loan} />)}
          </div>
        )}
      </div>

      <RequestLoanModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
