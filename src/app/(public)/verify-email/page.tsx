'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { authRepository } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { toast } from 'sonner'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no encontrado.')
      return
    }
    authRepository.verifyEmail(token)
      .then(res => {
        setStatus('success')
        setMessage(res.message || '¡Email verificado con éxito!')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'El enlace expiró o es inválido.')
      })
  }, [token])

  const handleResend = async () => {
    if (!resendEmail) { toast.error('Ingresa tu correo electrónico'); return }
    setResending(true)
    try {
      await authRepository.resendVerification(resendEmail)
      toast.success('Si el correo está registrado, recibirás un nuevo enlace.')
    } catch {
      toast.error('Error al reenviar. Intenta de nuevo.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="text-center max-w-sm w-full space-y-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando tu email...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-semibold">¡Email verificado!</h1>
          <p className="text-muted-foreground">{message}</p>
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Ir al dashboard
          </Button>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold">Error de verificación</h1>
          <p className="text-muted-foreground">{message}</p>
          <div className="space-y-2 pt-2 text-left">
            <p className="text-sm text-muted-foreground text-center">¿Quieres que te enviemos un nuevo enlace?</p>
            <Input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={resendEmail}
              onChange={e => setResendEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleResend()}
            />
            <Button className="w-full gap-2" onClick={handleResend} disabled={resending}>
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Reenviar email de verificación
            </Button>
          </div>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Volver al inicio</Link>
          </Button>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
