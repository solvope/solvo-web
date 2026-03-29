'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/widgets/dashboard-sidebar'
import { useAuthStore } from '@/features/auth'
import { Skeleton } from '@/shared/ui/skeleton'

export default function PrivateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter()
  const { isAuthenticated, isLoading, loadUser } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { loadUser() }, [loadUser])
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-32 mx-auto" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Header */}
      <header className="lg:hidden w-full py-4 px-6 flex justify-between items-center bg-[#0A192F] border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-[#D4AF37] to-[#D4AF37]/80 rounded-lg flex items-center justify-center shadow-sm">
            <i className="fa-solid fa-bolt text-[#0A192F]" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Solvo</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white text-2xl focus:outline-none p-1"
          aria-label="Abrir menú"
        >
          <i className="fa-solid fa-bars" />
        </button>
      </header>

      {/* Main content */}
      <main className="lg:ml-[280px] min-h-screen">
        <div className="max-w-[1366px] mx-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
