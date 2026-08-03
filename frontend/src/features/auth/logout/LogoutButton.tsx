import { Button } from '@/shared/ui/Button'

import { useLogout } from './useLogout'

export function LogoutButton() {
  const logout = useLogout()
  return (
    <Button variant="ghost" size="sm" onClick={() => void logout()}>
      Выйти
    </Button>
  )
}
