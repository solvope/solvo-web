'use client'
import { useEffect } from 'react'
import { CheckCheck } from 'lucide-react'
import { useNotificationStore } from '@/features/notifications'
import { NOTIFICATION_ICONS } from '@/entities/notification'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatRelativeDate } from '@/shared/lib/utils'

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, load, markAsRead, markAllAsRead } = useNotificationStore()

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} sin leer</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" /> Marcar todas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground text-sm">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors hover:bg-accent
                ${!n.isRead ? 'border-primary/30 bg-primary/5' : ''}`}
              onClick={() => !n.isRead && markAsRead(n.id)}
            >
              <span className="mt-0.5 text-base shrink-0">{NOTIFICATION_ICONS[n.type]}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">{formatRelativeDate(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
