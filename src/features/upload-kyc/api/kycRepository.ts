import { apiClient } from '@/shared/api/client'

export type KycUserStatus =
  | 'PENDING_VERIFICATION'
  | 'KYC_UNDER_REVIEW'
  | 'VERIFIED'
  | 'KYC_REJECTED'
  | 'SUSPENDED'

export interface KycStatus {
  isIdentityVerified: boolean
  status: KycUserStatus
}

export const kycRepository = {
  async getStatus(): Promise<KycStatus> {
    const { data } = await apiClient.get('/kyc/status')
    return {
      isIdentityVerified: data.data.isIdentityVerified,
      status: data.data.status as KycUserStatus,
    }
  },
  async upload(files: { dniFront: File; dniBack: File; selfie: File }): Promise<KycStatus> {
    const form = new FormData()
    form.append('dni_front', files.dniFront)
    form.append('dni_back', files.dniBack)
    form.append('selfie', files.selfie)
    const { data } = await apiClient.post('/kyc/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return {
      isIdentityVerified: data.data.isIdentityVerified ?? false,
      status: (data.data.status ?? 'KYC_UNDER_REVIEW') as KycUserStatus,
    }
  },
}
