import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LoginForm } from './LoginForm'

vi.mock('./useLoginMutation', () => ({
  useLoginMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}))

function submitForm() {
  fireEvent.submit(document.querySelector('form') as HTMLFormElement)
}

describe('LoginForm validation', () => {
  it('shows email and password errors on empty submit', async () => {
    render(<LoginForm />)
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('Некорректный email')).toBeInTheDocument()
      expect(screen.getByText('Минимум 6 символов')).toBeInTheDocument()
    })
  })

  it('shows email error for invalid email format', async () => {
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'notanemail' } })
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('Некорректный email')).toBeInTheDocument()
    })
  })

  it('shows password error when password is too short', async () => {
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: '123' } })
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('Минимум 6 символов')).toBeInTheDocument()
    })
  })

  it('no validation errors when form is filled correctly', async () => {
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } })
    submitForm()
    await waitFor(() => {
      expect(screen.queryByText('Некорректный email')).not.toBeInTheDocument()
      expect(screen.queryByText('Минимум 6 символов')).not.toBeInTheDocument()
    })
  })
})
