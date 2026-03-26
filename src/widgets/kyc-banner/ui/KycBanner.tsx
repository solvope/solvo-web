import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function KycBanner() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 flex items-start gap-3">
      <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">Verifica tu identidad</p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
          Para solicitar préstamos necesitas verificar tu DNI y selfie.
        </p>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40">
        <Link href="/kyc">Verificar</Link>
      </Button>
    </div>
  )
}
