import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell } from 'lucide-react'

import { useNotificationsStore } from '@/entities/notifications'

import { formatDate } from '@/shared/lib/formatDate'

export function NotificationsDropdown() {
  const notifications = useNotificationsStore((s) => s.notifications)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const clearAll = useNotificationsStore((s) => s.clearAll)

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu.Root
      onOpenChange={(open) => {
        if (open) markAllRead()
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Уведомления"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-lg border border-input bg-background shadow-lg outline-none"
        >
          <div className="flex items-center justify-between border-b border-input px-4 py-2.5">
            <span className="text-sm font-semibold">Уведомления</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Очистить
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Нет уведомлений</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="border-b border-input px-4 py-3 last:border-0">
                  <p className="text-sm font-medium">{n.message}</p>
                  {n.newsTitle && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.newsTitle}</p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
