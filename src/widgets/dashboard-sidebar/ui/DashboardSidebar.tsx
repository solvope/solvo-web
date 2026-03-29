'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth'

interface NavItem {
  href: string
  icon: string
  label: string
  matchPrefix?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',     icon: 'fa-solid fa-house',                label: 'Dashboard' },
  { href: '/loans',         icon: 'fa-solid fa-wallet',               label: 'Mis Préstamos',      matchPrefix: '/loans' },
  { href: '/payments',      icon: 'fa-solid fa-money-bill-transfer',  label: 'Pagos' },
  { href: '/request-loan',  icon: 'fa-solid fa-hand-holding-dollar',  label: 'Solicitar Préstamo' },
  { href: '/profile',       icon: 'fa-solid fa-user',                 label: 'Mi Perfil' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ isOpen, onClose }: Props) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const isActive = (item: NavItem) => {
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
    return pathname === item.href
  }

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U'

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[280px] z-40
          bg-[#0A192F] border-r border-white/4
          flex flex-col py-8 px-6 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo — only visible on desktop */}
        <div className="hidden lg:flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-linear-to-br from-[#D4AF37] to-[#D4AF37]/80 rounded-xl flex items-center justify-center ">
            <i className="fa-solid fa-bolt text-[#0A192F] text-xl" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Solvo</span>
        </div>

        {/* User card */}
        <div className="flex items-center gap-4 mb-10 p-4 rounded-lg bg-white/4 border border-white/6">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#D4AF37] to-[#D4AF37]/80 flex items-center justify-center text-[#0A192F] text-lg font-bold border-2 border-[#00E5FF] shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-400">{greeting},</p>
            <p className="text-white font-semibold truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="grow space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors
                  ${active
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <i className={`${item.icon} w-5 text-center`} />
                {item.label}
              </Link>
            )
          })}

        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-6 border-t border-white/6 space-y-1">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors w-full"
          >
            {mounted ? (
              <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'} w-5 text-center`} />
            ) : (
              <span className="w-5" />
            )}
            {mounted ? (isDark ? 'Modo Claro' : 'Modo Oscuro') : 'Tema'}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors w-full"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}
