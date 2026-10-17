import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockLogin = vi.fn()
const mockUseAuth = vi.fn()
const mockReplace = vi.fn()

vi.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import { LoginForm } from '@/components/auth/login-form'

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ login: mockLogin, status: 'guest' })
  mockLogin.mockResolvedValue(undefined)
})

describe('LoginForm', () => {
  it('muestra los campos de usuario y contraseña', () => {
    render(<LoginForm next="/" />)
    expect(screen.getByLabelText(/Usuario o correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()
  })

  it('hace login con el identificador y la contraseña escritos', async () => {
    const user = userEvent.setup({ delay: null })
    render(<LoginForm next="/" />)

    await user.type(screen.getByLabelText(/Usuario o correo electrónico/i), 'alan@example.com')
    await user.type(screen.getByLabelText(/Contraseña/i), 'MiPass123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(mockLogin).toHaveBeenCalledWith('alan@example.com', 'MiPass123')
  })

  it('recorta los espacios del identificador', async () => {
    const user = userEvent.setup({ delay: null })
    render(<LoginForm next="/" />)

    await user.type(screen.getByLabelText(/Usuario o correo electrónico/i), '  alan@example.com  ')
    await user.type(screen.getByLabelText(/Contraseña/i), 'MiPass123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(mockLogin).toHaveBeenCalledWith('alan@example.com', 'MiPass123')
  })

  it('redirige tras un login exitoso', async () => {
    const user = userEvent.setup({ delay: null })
    render(<LoginForm next="/account" />)

    await user.type(screen.getByLabelText(/Usuario o correo electrónico/i), 'alan@example.com')
    await user.type(screen.getByLabelText(/Contraseña/i), 'MiPass123')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(mockReplace).toHaveBeenCalledWith('/account')
  })

  it('muestra el mensaje de error cuando el login falla', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales inválidas'))
    const user = userEvent.setup({ delay: null })
    render(<LoginForm next="/" />)

    await user.type(screen.getByLabelText(/Usuario o correo electrónico/i), 'alan@example.com')
    await user.type(screen.getByLabelText(/Contraseña/i), 'malaclave')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument()
  })

  it('no redirige cuando el login falla', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales inválidas'))
    const user = userEvent.setup({ delay: null })
    render(<LoginForm next="/account" />)

    await user.type(screen.getByLabelText(/Usuario o correo electrónico/i), 'alan@example.com')
    await user.type(screen.getByLabelText(/Contraseña/i), 'malaclave')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('redirige automáticamente si el usuario ya está autenticado', () => {
    mockUseAuth.mockReturnValue({ login: mockLogin, status: 'authenticated' })
    render(<LoginForm next="/account" />)
    expect(mockReplace).toHaveBeenCalledWith('/account')
  })

  it('enlaza a recuperar contraseña', () => {
    render(<LoginForm next="/" />)
    expect(screen.getByRole('link', { name: /olvidado tu contraseña/i })).toHaveAttribute('href', '/forgot-password')
  })
})