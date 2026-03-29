import { apiClient } from '@/shared/api/client'
import type { Loan, LoanBalance, Payment, Installment, EarlyPayoffQuote } from '@/entities/loan'

export interface SimulateDTO {
  amount: number
  productType: string
  paymentFrequency: string
  numInstallments: number
}

export interface SimulationResult {
  amount: number
  tea: number
  teaPercent: number
  tcea: number
  tceaPercent: number
  disbursementFee: number
  techFee: number
  maintenanceFee: number
  maintenanceFeeTotal: number
  igvAmount: number
  netDisbursed: number
  numInstallments: number
  installmentAmount: number
  totalInterest: number
  totalAmount: number
}

export const loanRepository = {
  async simulate(dto: SimulateDTO): Promise<SimulationResult> {
    const { data } = await apiClient.post('/loans/simulate', dto)
    return data.data
  },
  async requestLoan(dto: { amount: number; productType: string; paymentFrequency: string; numInstallments: number }): Promise<Loan> {
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
  async getSchedule(loanId: string): Promise<Installment[]> {
    const { data } = await apiClient.get(`/loans/${loanId}/schedule`)
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
  async partialPayment(loanId: string, dto: { amount: number; method: string; reference?: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments/partial', { loanId, ...dto })
    return data.data
  },
  async getEarlyPayoffQuote(loanId: string): Promise<EarlyPayoffQuote> {
    const { data } = await apiClient.get(`/payments/early-payoff/${loanId}`)
    return data.data
  },
  async earlyPayoff(dto: { loanId: string; method: string; reference?: string; culqiToken?: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments/early-payoff', dto)
    return data.data
  },
  async getContractUrl(loanId: string): Promise<string> {
    const { data } = await apiClient.get(`/loans/${loanId}/contract`)
    return data.data.url
  },
  async chargeCard(dto: { loanId: string; amount: number; culqiToken: string }): Promise<Payment> {
    const { data } = await apiClient.post('/payments/charge', dto)
    return data.data
  },
}
