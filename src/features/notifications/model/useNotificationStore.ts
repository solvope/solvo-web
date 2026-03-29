import { create } from 'zustand'
import { notificationsRepository } from '../api/notificationsRepository'
import type { Notification } from '@/entities/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  load: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  load: async () => {
    set({ isLoading: true })
    try {
      const raw = await notificationsRepository.getAll()
      const notifications = Array.isArray(raw) ? raw : []
      set({ notifications, unreadCount: notifications.filter(n => !n.isRead).length })
    } finally {
      set({ isLoading: false })
    }
  },

  markAsRead: async (id) => {
    await notificationsRepository.markAsRead(id)
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: async () => {
    await notificationsRepository.markAllAsRead()
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },
}))
