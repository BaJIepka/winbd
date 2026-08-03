import { useState } from 'react'

import { LoginForm } from '@/features/auth/login'
import { RegisterForm } from '@/features/auth/register'

import { Button } from '@/shared/ui/Button'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h1>

        {mode === 'login' ? <LoginForm /> : <RegisterForm />}

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <Button variant="link" className="h-auto p-0" onClick={() => setMode('register')}>
                Зарегистрироваться
              </Button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <Button variant="link" className="h-auto p-0" onClick={() => setMode('login')}>
                Войти
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
