import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/shared/ui/sonner'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solvo — Mini préstamos para Perú',
  description: 'Préstamos rápidos y seguros de S/. 100 a S/. 2,000. Aprobación en minutos.',
  keywords: ['préstamos', 'fintech', 'Perú', 'mini préstamos', 'crédito rápido'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        {/* Culqi Checkout — cargado al final para no bloquear el render */}
        <Script src="https://checkout.culqi.com/js/v4" strategy="lazyOnload" />
      </body>
    </html>
  )
}
