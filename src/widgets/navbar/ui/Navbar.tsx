'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, LayoutDashboard, CreditCard, FileText, User } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useNotificationStore } from '@/features/notifications'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Button } from '@/shared/ui/button'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/loans', label: 'Préstamos', icon: CreditCard },
  { href: '/kyc', label: 'Verificación', icon: FileText },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
          Solvo
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/notifications" className="relative p-2 rounded-md hover:bg-accent transition-colors">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <span className="hidden md:block text-sm text-muted-foreground">{user?.firstName}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="hidden md:inline-flex">
            Salir
          </Button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background flex">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors
              ${pathname === href ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
        <Link
          href="/notifications"
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium relative transition-colors
            ${pathname === '/notifications' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1/2 translate-x-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          Alertas
        </Link>
      </nav>
    </header>
  )
}
