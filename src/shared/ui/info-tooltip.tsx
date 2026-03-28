'use client'
import { Info } from 'lucide-react'

interface Props {
  text: string
}

/**
 * Ícono de información con tooltip que aparece al hacer hover.
 * Implementación CSS-only usando group + Tailwind (sin dependencias extra).
 */
export function InfoTooltip({ text }: Readonly<Props>) {
  return (
    <span className="group relative inline-flex items-center">
      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" />
      <span
        className="
          pointer-events-none absolute bottom-full left-1/2 z-50 mb-2
          w-56 -translate-x-1/2 rounded-lg border border-border/60
          bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
        "
      >
        {text}
        {/* Arrow */}
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 border-b border-r border-border/60 bg-popover" />
      </span>
    </span>
  )
}
