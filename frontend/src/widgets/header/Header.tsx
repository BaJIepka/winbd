import { Link } from 'react-router-dom'

import { NotificationsDropdown } from '@/widgets/notifications/NotificationsDropdown'

import { LogoutButton } from '@/features/auth/logout'

import { useAuthStore } from '@/entities/user'

export function Header() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-semibold text-lg tracking-tight">
          Редактор новостей
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:inline text-sm text-muted-foreground">{user.email}</span>
          )}
          <NotificationsDropdown />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
