import { apiClient } from '@/shared/api/client'

export interface KycStatus {
  isIdentityVerified: boolean
  status: string  // UserStatus: PENDING_VERIFICATION | VERIFIED | SUSPENDED
}

export const kycRepository = {
  async getStatus(): Promise<KycStatus> {
    const { data } = await apiClient.get('/kyc/status')
    return {
      isIdentityVerified: data.data.isIdentityVerified,
      status: data.data.status,
    }
  },
  async upload(files: { dniFront: File; dniBack: File; selfie: File }): Promise<void> {
    const form = new FormData()
    form.append('dni_front', files.dniFront)
    form.append('dni_back', files.dniBack)
    form.append('selfie', files.selfie)
    await apiClient.post('/kyc/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
