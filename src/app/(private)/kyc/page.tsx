'use client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Upload, CheckCircle, Loader2 } from 'lucide-react'
import { kycRepository, type KycStatus } from '@/features/upload-kyc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

const DOC_FIELDS = [
  { key: 'dniFront' as const, label: 'DNI – Anverso (parte delantera)', hint: 'Sube la parte frontal de tu DNI' },
  { key: 'dniBack'  as const, label: 'DNI – Reverso (parte trasera)',   hint: 'Sube la parte trasera de tu DNI' },
  { key: 'selfie'   as const, label: 'Selfie sosteniendo el DNI',        hint: 'Tómate una foto sujetando tu DNI' },
]

export default function KycPage() {
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<{ dniFront?: File; dniBack?: File; selfie?: File }>({})
  const refs = {
    dniFront: useRef<HTMLInputElement>(null),
    dniBack:  useRef<HTMLInputElement>(null),
    selfie:   useRef<HTMLInputElement>(null),
  }

  useEffect(() => {
    kycRepository.getStatus()
      .then(setKycStatus)
      .catch(() => setKycStatus({ status: 'PENDING_VERIFICATION', isIdentityVerified: false }))
  }, [])

  const handleUpload = async () => {
    if (!files.dniFront || !files.dniBack || !files.selfie) {
      toast.error('Debes subir los tres documentos')
      return
    }
    setIsUploading(true)
    try {
      await kycRepository.upload({ dniFront: files.dniFront, dniBack: files.dniBack, selfie: files.selfie })
      toast.success('¡Identidad verificada correctamente!')
      setKycStatus({ isIdentityVerified: true, status: 'VERIFIED' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir documentos')
    } finally {
      setIsUploading(false)
    }
  }

  const allSelected = !!files.dniFront && !!files.dniBack && !!files.selfie

  if (kycStatus?.isIdentityVerified) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div>
          <h1 className="text-2xl font-bold">Verificación de identidad</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold text-lg">¡Identidad verificada!</p>
            <p className="text-sm text-muted-foreground">Tu cuenta está verificada. Ya puedes solicitar préstamos.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Verificación de identidad</h1>
        <p className="text-muted-foreground text-sm">Sube tus documentos para activar tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos requeridos</CardTitle>
          <CardDescription>
            Se necesita el DNI completo (anverso y reverso) y una selfie sosteniéndolo. Formato JPG o PNG, máx. 5 MB cada uno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DOC_FIELDS.map(({ key, label, hint }) => (
            <div key={key}>
              <p className="text-sm font-medium mb-1">{label}</p>
              <div
                className="flex items-center gap-3 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => refs[key].current?.click()}
              >
                {files[key]
                  ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  : <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                }
                <div className="min-w-0">
                  <p className="text-sm truncate">
                    {files[key] ? files[key]!.name : hint}
                  </p>
                  {files[key] && (
                    <p className="text-xs text-muted-foreground">
                      {(files[key]!.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
              </div>
              <input
                ref={refs[key]}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={e => setFiles(prev => ({ ...prev, [key]: e.target.files?.[0] }))}
              />
            </div>
          ))}

          <Button
            className="w-full mt-2"
            onClick={handleUpload}
            disabled={isUploading || !allSelected}
          >
            {isUploading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</>
              : 'Enviar documentos'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            🔒 Tus datos se transmiten de forma segura conforme a la Ley N° 29733 de Protección de Datos Personales.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
