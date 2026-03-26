export interface Loan {
  id: string
  userId: string
  amount: number
  totalAmount: number
  currency: string
  termDays: number
  interestRate: number
  tier: string
  status: LoanStatus
  dueDate?: string
  contractUrl?: string
  rejectionReason?: string
  disbursedAt?: string
  createdAt: string
  updatedAt: string
}

export type LoanStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIGNED'
  | 'DISBURSED' | 'ACTIVE' | 'OVERDUE' | 'PAID' | 'CANCELLED'

export interface LoanBalance {
  loanId: string
  totalAmount: number
  totalPaid: number
  remaining: number
  isFullyPaid: boolean
  currency: string
  dueDate?: string
  isOverdue: boolean
}

export interface Payment {
  id: string
  loanId: string
  amount: number
  currency: string
  method: string
  status: string
  reference?: string
  paidAt: string
}
