import Link from 'next/link'
import { ArrowRight, Calendar, DollarSign } from 'lucide-react'
import type { Loan } from '@/entities/loan'
import { LoanStatusBadge } from '@/entities/loan'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { formatCurrency, formatDate } from '@/shared/lib/utils'

interface Props {
  loan: Loan
}

export function LoanCard({ loan }: Props) {
  return (
    <Link href={`/loans/${loan.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <p className="text-sm text-muted-foreground">Préstamo</p>
            <p className="text-2xl font-bold">{formatCurrency(loan.amount)}</p>
          </div>
          <LoanStatusBadge status={loan.status} />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Solicitado: {formatDate(loan.createdAt)}
            </span>
            {loan.dueDate && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                Vence: {formatDate(loan.dueDate)}
              </span>
            )}
          </div>
<div className="flex items-center justify-end text-sm text-primary font-medium">
            Ver detalle <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
