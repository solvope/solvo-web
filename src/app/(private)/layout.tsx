'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/widgets/navbar'
import { useAuthStore } from '@/features/auth'
import { Skeleton } from '@/shared/ui/skeleton'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading, loadUser } = useAuthStore()

  useEffect(() => { loadUser() }, [loadUser])
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login')
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-32 mx-auto" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
