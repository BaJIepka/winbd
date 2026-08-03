import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { RegisterForm } from './RegisterForm'

vi.mock('./useRegisterMutation', () => ({
  useRegisterMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}))

function submitForm() {
  fireEvent.submit(document.querySelector('form') as HTMLFormElement)
}

describe('RegisterForm validation', () => {
  it('shows errors on empty submit', async () => {
    render(<RegisterForm />)
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('Некорректный email')).toBeInTheDocument()
      expect(screen.getByText('Минимум 8 символов')).toBeInTheDocument()
    })
  })

  it('shows password mismatch error', async () => {
    render(<RegisterForm />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
      target: { value: 'different456' },
    })
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument()
    })
  })

  it('shows email error for invalid format', async () => {
    render(<RegisterForm />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
      target: { value: 'password123' },
    })
    submitForm()
    await waitFor(() => {
      expect(screen.getByText('Некорректный email')).toBeInTheDocument()
    })
  })

  it('no errors when all fields are valid', async () => {
    render(<RegisterForm />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'valid@test.com' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), {
      target: { value: 'password123' },
    })
    submitForm()
    await waitFor(() => {
      expect(screen.queryByText('Некорректный email')).not.toBeInTheDocument()
      expect(screen.queryByText('Пароли не совпадают')).not.toBeInTheDocument()
    })
  })
})
