'use client'
import { useRouter } from 'next/navigation'
import { LogOut, User, Mail, Shield } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) return null

  const fields = [
    { icon: User, label: 'Nombre', value: `${user.firstName} ${user.lastName}` },
    { icon: Mail, label: 'Correo', value: user.email },
  ]

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-muted-foreground text-sm">Información de tu cuenta</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {user.firstName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-lg">{user.firstName} {user.lastName}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            {user.emailVerified ? 'Email verificado' : 'Email no verificado'}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {fields.map(({ icon: Icon, label, value }, i) => (
            <div key={label}>
              {i > 0 && <Separator className="mb-3" />}
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preferencias</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tema</p>
              <p className="text-xs text-muted-foreground">Claro, oscuro o según el sistema</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </Button>
    </div>
  )
}
