import { create } from 'zustand'
import { loanRepository } from '../api/loanRepository'
import type { Loan, LoanBalance, Payment } from '@/entities/loan'

interface LoanState {
  loans: Loan[]
  activeLoan: Loan | null
  selectedLoan: Loan | null
  balance: LoanBalance | null
  payments: Payment[]
  isLoading: boolean
  loadMyLoans: () => Promise<void>
  loadLoanDetails: (loanId: string) => Promise<void>
  requestLoan: (dto: { amount: number; termDays: number }) => Promise<Loan>
  signLoan: (loanId: string) => Promise<void>
  payLoan: (loanId: string, dto: { amount: number; method: string; reference?: string }) => Promise<void>
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  activeLoan: null,
  selectedLoan: null,
  balance: null,
  payments: [],
  isLoading: false,

  loadMyLoans: async () => {
    set({ isLoading: true })
    try {
      const loans = await loanRepository.getMyLoans()
      const activeLoan = loans.find(l => ['APPROVED', 'SIGNED', 'ACTIVE', 'OVERDUE'].includes(l.status)) ?? null
      set({ loans, activeLoan })
    } finally {
      set({ isLoading: false })
    }
  },

  loadLoanDetails: async (loanId) => {
    set({ isLoading: true })
    try {
      const [loan, balance, payments] = await Promise.all([
        loanRepository.getLoanById(loanId),
        loanRepository.getLoanBalance(loanId),
        loanRepository.getLoanPayments(loanId),
      ])
      set({ selectedLoan: loan, balance, payments })
    } finally {
      set({ isLoading: false })
    }
  },

  requestLoan: async (dto: { amount: number; termDays: number }) => {
    const loan = await loanRepository.requestLoan(dto)
    await get().loadMyLoans()
    return loan
  },

  signLoan: async (loanId) => {
    await loanRepository.signLoan(loanId)
    await get().loadMyLoans()
  },

  payLoan: async (loanId, dto) => {
    await loanRepository.payLoan(loanId, dto)
    await get().loadLoanDetails(loanId)
    await get().loadMyLoans()
  },
}))
