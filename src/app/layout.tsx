import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/shared/ui/sonner'
import Script from 'next/script'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Solvo — Mini préstamos para Perú',
  description: 'Préstamos rápidos y seguros de S/. 200 a S/. 2,000. Aprobación en minutos.',
  keywords: ['préstamos', 'fintech', 'Perú', 'mini préstamos', 'crédito rápido'],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-[family-name:var(--font-sans)]`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Script src="https://checkout.culqi.com/js/v4" strategy="lazyOnload" />
      </body>
    </html>
  )
}
