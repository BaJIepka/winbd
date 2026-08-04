import { type ReactNode, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { NEWS_KEY, NEWS_LIST_KEY } from '@/entities/news'
import type { NotificationType } from '@/entities/notifications'
import { useNotificationsStore } from '@/entities/notifications'
import { useAuthStore } from '@/entities/user'

import { connectSocket, disconnectSocket, getSocket } from '@/shared/socket/socket'

interface NewsPayload {
  _id: string
  title: string
}

interface DeletePayload {
  newsId: string
}

const EVENT_LABELS: Record<NotificationType, string> = {
  'news:created': 'Статья создана',
  'news:updated': 'Статья обновлена',
  'news:deleted': 'Статья удалена',
  'news:published': 'Статья опубликована',
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken)
    } else {
      disconnectSocket()
    }
  }, [accessToken])

  useEffect(() => {
    const socket = getSocket()

    function handleNews(type: NotificationType) {
      return (payload: NewsPayload) => {
        addNotification({
          type,
          message: EVENT_LABELS[type],
          newsId: payload._id,
          newsTitle: payload.title,
        })
        // These events can originate from another tab/user or the server-side scheduler,
        // so the local query cache needs to be invalidated explicitly — it won't happen
        // as a side effect of an HTTP mutation the way it does for the acting client.
        void queryClient.invalidateQueries({ queryKey: [NEWS_LIST_KEY] })
        void queryClient.invalidateQueries({ queryKey: [NEWS_KEY, payload._id] })
      }
    }

    function handleDeleted(payload: DeletePayload) {
      addNotification({
        type: 'news:deleted',
        message: EVENT_LABELS['news:deleted'],
        newsId: payload.newsId,
        newsTitle: '',
      })
      void queryClient.invalidateQueries({ queryKey: [NEWS_LIST_KEY] })
    }

    socket.on('news:created', handleNews('news:created'))
    socket.on('news:updated', handleNews('news:updated'))
    socket.on('news:published', handleNews('news:published'))
    socket.on('news:deleted', handleDeleted)

    return () => {
      socket.off('news:created')
      socket.off('news:updated')
      socket.off('news:published')
      socket.off('news:deleted')
    }
  }, [addNotification, queryClient])

  return <>{children}</>
}
