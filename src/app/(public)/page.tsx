import Link from 'next/link'
import { ArrowRight, Shield, Zap, Clock } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { LoanSimulator } from '@/features/simulator/ui/LoanSimulator'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-bold text-xl text-primary">Solvo</span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Mini préstamos <span className="text-primary">rápidos</span> y{' '}
          <span className="text-secondary">seguros</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          De S/ 200 a S/ 2,000. Aprobación en minutos. Sin trámites complicados.
          Solo necesitas tu DNI.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/register">
            Solicitar ahora <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Aprobación en minutos',
              desc: 'Revisamos tu solicitud de forma inmediata. Sin esperas innecesarias.',
            },
            {
              icon: Shield,
              title: '100% seguro',
              desc: 'Tus datos están protegidos con cifrado de nivel bancario.',
            },
            {
              icon: Clock,
              title: 'Plazos flexibles',
              desc: 'Elige entre 7, 14 o 30 días según tus posibilidades de pago.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simulador */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Simula tu préstamo</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Calcula cuánto pagarías antes de solicitar. Sin compromiso, sin registro.
          </p>
        </div>
        <LoanSimulator />
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-y">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-muted-foreground mb-8">Crea tu cuenta gratis y solicita tu primer préstamo hoy.</p>
          <Button asChild size="lg">
            <Link href="/register">Crear cuenta gratis</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Solvo. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}
