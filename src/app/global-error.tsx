'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Algo salió mal</h2>
          <p className="text-muted-foreground text-sm">
            Ocurrió un error inesperado. Nuestro equipo ya fue notificado.
          </p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={reset}
            type="button"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
