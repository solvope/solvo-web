import { apiClient } from '@/shared/api/client'

export type LoanProductType = 'EXPRESS' | 'FLEX'
export type PaymentFrequency = 'QUINCENAL' | 'MENSUAL'

export interface SimulateParams {
  amount: number
  productType: LoanProductType
  paymentFrequency: PaymentFrequency
}

export interface ScheduleItem {
  installmentNumber: number
  dueDate: string
  principal: number
  interest: number
  maintenanceFee: number
  techFeePerPeriod: number
  igvPerPeriod: number
  amount: number
}

export interface SimulationResult {
  amount: number
  scoreTier: string
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
  periodDays: number
  termDays: number
  installmentAmount: number
  totalInterest: number
  totalAmount: number
  schedule: ScheduleItem[]
}

export async function simulate(params: SimulateParams): Promise<SimulationResult> {
  const { data } = await apiClient.post('/loans/simulate', params)
  return data.data
}
