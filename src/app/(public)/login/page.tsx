import Link from 'next/link'
import { LoginForm } from '@/features/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">Solvo</Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Ingresa a tu cuenta para gestionar tus préstamos</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col gap-3 items-center">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
