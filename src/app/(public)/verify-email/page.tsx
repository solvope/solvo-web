'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { authRepository } from '@/features/auth'
import { Button } from '@/shared/ui/button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

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
          <Button asChild variant="outline" className="w-full">
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
