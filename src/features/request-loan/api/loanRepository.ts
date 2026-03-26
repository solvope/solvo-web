import { apiClient } from '@/shared/api/client'
import type { Loan, LoanBalance, Payment } from '@/entities/loan'

export const loanRepository = {
  async requestLoan(dto: { amount: number; termDays: number }): Promise<Loan> {
    const { data } = await apiClient.post('/loans', dto)
    return data.data
  },
  async getMyLoans(): Promise<Loan[]> {
    const { data } = await apiClient.get('/loans')
    return data.data
  },
  async getLoanById(loanId: string): Promise<Loan> {
    const { data } = await apiClient.get(`/loans/${loanId}`)
    return data.data
  },
  async getLoanBalance(loanId: string): Promise<LoanBalance> {
    const { data } = await apiClient.get(`/payments/balance/${loanId}`)
    return data.data
  },
  async getLoanPayments(loanId: string): Promise<Payment[]> {
    const { data } = await apiClient.get(`/payments/history/${loanId}`)
    return data.data
  },
  async signLoan(loanId: string): Promise<Loan> {
    const { data } = await apiClient.post(`/loans/${loanId}/sign`, { acceptedTerms: true })
    return data.data
  },
  async payLoan(loanId: string, dto: { amount: number; method: string; reference?: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments', { loanId, ...dto })
    return data.data
  },
}
