'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { authRepository } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { toast } from 'sonner'

const schema = z.object({
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    if (!token) { toast.error('Enlace inválido. Solicita uno nuevo.'); return }
    try {
      await authRepository.resetPassword(token, values.newPassword)
      setDone(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al restablecer la contraseña')
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Enlace inválido o expirado.</p>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Solicitar nuevo enlace</Link>
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>Ingresa tu nueva contraseña para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-medium">¡Contraseña restablecida!</p>
            <p className="text-sm text-muted-foreground">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Ir al inicio de sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...register('newPassword')}
              />
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restablecer contraseña
            </Button>
          </form>
        )}
      </CardContent>
      {!done && (
        <CardFooter className="justify-center">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">Solvo</Link>
        </div>
        <Suspense fallback={
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  )
}
