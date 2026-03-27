'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { authRepository } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'

const schema = z.object({
  email: z.string().email('Ingresa un email válido'),
})
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    await authRepository.forgotPassword(values.email)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">Solvo</Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recuperar contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Si el correo está registrado, recibirás un enlace en los próximos minutos.
                  Revisa también tu carpeta de spam.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar enlace
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
