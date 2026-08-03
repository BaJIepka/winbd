import { create } from 'zustand'

export type NotificationType = 'news:created' | 'news:updated' | 'news:deleted' | 'news:published'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  newsId: string
  newsTitle: string
  createdAt: string
  read: boolean
}

interface NotificationsState {
  notifications: Notification[]
  addNotification: (payload: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],

  addNotification: (payload) => {
    const item: Notification = {
      ...payload,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ notifications: [item, ...state.notifications] }))
  },

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),
}))
