'use client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Upload, CheckCircle, Clock, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { kycRepository, type KycStatus } from '@/features/upload-kyc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

const DOC_FIELDS = [
  { key: 'dniFront' as const, label: 'DNI – Anverso (parte delantera)', hint: 'Sube la parte frontal de tu DNI' },
  { key: 'dniBack' as const, label: 'DNI – Reverso (parte trasera)', hint: 'Sube la parte trasera de tu DNI' },
  { key: 'selfie' as const, label: 'Selfie sosteniendo el DNI', hint: 'Tómate una foto sujetando tu DNI' },
]

// ─── Estado: Verificado ───────────────────────────────────────────────────────
function KycVerified() {
  return (
    <Card>
      <CardContent className="pt-6 text-center space-y-3">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
        <p className="font-bold text-lg">¡Identidad verificada!</p>
        <p className="text-sm text-muted-foreground">
          Tu cuenta está verificada. Ya puedes solicitar préstamos de hasta S/. 2,000.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Estado: En revisión ──────────────────────────────────────────────────────
function KycUnderReview({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
      <CardContent className="pt-6 text-center space-y-4">
        <Clock className="h-14 w-14 text-yellow-500 mx-auto" />
        <div>
          <p className="font-bold text-lg">Verificando tu identidad</p>
          <p className="text-sm text-muted-foreground mt-1">
            Hemos recibido tus documentos. La verificación suele tardar entre
            1 y 5 minutos. Te notificaremos cuando esté lista.
          </p>
        </div>
        <Alert className="text-left">
          <AlertTitle>¿Qué sigue?</AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-1">
            <p>✅ Documentos subidos correctamente</p>
            <p>⏳ Verificando DNI contra RENIEC</p>
            <p>⏳ Validando reconocimiento facial</p>
          </AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" className="gap-2" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" /> Verificar estado
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Estado: Rechazado ────────────────────────────────────────────────────────
function KycRejected({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="pt-6 text-center space-y-4">
        <XCircle className="h-14 w-14 text-destructive mx-auto" />
        <div>
          <p className="font-bold text-lg">Verificación no aprobada</p>
          <p className="text-sm text-muted-foreground mt-1">
            No pudimos verificar tu identidad con los documentos enviados.
            Asegúrate de que las fotos sean nítidas y vuelve a intentarlo.
          </p>
        </div>
        <Alert variant="destructive" className="text-left">
          <AlertTitle>Consejos para el reintento</AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-1">
            <p>• Foto del DNI en ambiente bien iluminado, sin reflejos</p>
            <p>• Toda la información debe ser legible</p>
            <p>• En la selfie, asegúrate de sostener el DNI visible</p>
          </AlertDescription>
        </Alert>
        <Button className="w-full gap-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Volver a intentar
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Formulario de upload ─────────────────────────────────────────────────────
export default function KycPage() {
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [files, setFiles] = useState<{ dniFront?: File; dniBack?: File; selfie?: File }>({})
  const refs = {
    dniFront: useRef<HTMLInputElement>(null),
    dniBack: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  }

  const loadStatus = () => {
    kycRepository.getStatus()
      .then(setKycStatus)
      .catch(() => setKycStatus({ status: 'PENDING_VERIFICATION', isIdentityVerified: false }))
  }

  useEffect(() => { loadStatus() }, [])

  const handleUpload = async () => {
    if (!files.dniFront || !files.dniBack || !files.selfie) {
      toast.error('Debes subir los tres documentos')
      return
    }
    setIsUploading(true)
    try {
      const result = await kycRepository.upload({ dniFront: files.dniFront, dniBack: files.dniBack, selfie: files.selfie })
      setKycStatus(result)
      setShowForm(false)
      if (result.isIdentityVerified) {
        toast.success('¡Identidad verificada correctamente!')
      } else {
        toast.success('Documentos recibidos. Verificando en instantes...')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir documentos')
    } finally {
      setIsUploading(false)
    }
  }

  const allSelected = !!files.dniFront && !!files.dniBack && !!files.selfie

  const renderStatus = () => {
    if (!kycStatus) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

    if (kycStatus.isIdentityVerified) return <KycVerified />
    if (kycStatus.status === 'KYC_UNDER_REVIEW') return <KycUnderReview onRefresh={loadStatus} />
    if (kycStatus.status === 'KYC_REJECTED' && !showForm) return <KycRejected onRetry={() => { setFiles({}); setShowForm(true) }} />
    return null
  }

  const showUploadForm =
    !kycStatus ||
    kycStatus.status === 'PENDING_VERIFICATION' ||
    showForm

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Verificación de identidad</h1>
        <p className="text-muted-foreground text-sm">Requerida para solicitar préstamos</p>
      </div>

      {renderStatus()}

      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos requeridos</CardTitle>
            <CardDescription>
              DNI (anverso y reverso) + selfie sosteniéndolo. JPG o PNG, máx. 5 MB cada uno.
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
                    <p className="text-sm truncate">{files[key] ? files[key]!.name : hint}</p>
                    {files[key] && (
                      <p className="text-xs text-muted-foreground">{(files[key]!.size / 1024).toFixed(0)} KB</p>
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

            <Button className="w-full mt-2" onClick={handleUpload} disabled={isUploading || !allSelected}>
              {isUploading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</>
                : 'Enviar documentos'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              🔒 Tus datos se transmiten de forma segura conforme a la Ley N° 29733.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
