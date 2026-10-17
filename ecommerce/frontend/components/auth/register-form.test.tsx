import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockRegister = vi.fn()
const mockUseAuth = vi.fn()
const mockReplace = vi.fn()
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))
vi.mock('sonner', () => ({ toast: toastMock }))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import { RegisterForm } from '@/components/auth/register-form'

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ register: mockRegister, status: 'guest' })
  mockRegister.mockResolvedValue(undefined)
})

async function fillCommon(user: ReturnType<typeof userEvent.setup>, password = 'MiPass123', confirm = 'MiPass123') {
  // Todos los campos son `required`: si falta alguno, la validación HTML5
  // bloquea el submit y requestSubmit() nunca dispara onSubmit.
  await user.type(screen.getByLabelText(/^Nombre$/i), 'Alan')
  await user.type(screen.getByLabelText(/^Apellidos$/i), 'Vasquez')
  await user.type(screen.getByLabelText(/nombre de usuario/i), 'alan')
  await user.type(screen.getByLabelText(/correo electrónico/i), 'alan@example.com')
  await user.type(screen.getByLabelText(/^Contraseña$/i), password)
  await user.type(screen.getByLabelText(/confirmar contraseña/i), confirm)
}

describe('RegisterForm — validaciones', () => {
  it('rechaza contraseñas que no coinciden', async () => {
    const user = userEvent.setup({ delay: null })
    render(<RegisterForm next="/" />)

    await fillCommon(user, 'MiPass123', 'OtraClave123')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('rechaza contraseñas de menos de 8 caracteres', async () => {
    const user = userEvent.setup({ delay: null })
    render(<RegisterForm next="/" />)

    await fillCommon(user, 'corta7', 'corta7')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/al menos 8 caracteres/i)).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('no llama register si la validación falla', async () => {
    const user = userEvent.setup({ delay: null })
    render(<RegisterForm next="/" />)

    await fillCommon(user, '123', '456')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(mockRegister).not.toHaveBeenCalled()
  })
})

describe('RegisterForm — envío', () => {
  it('registra con los datos escritos', async () => {
    const user = userEvent.setup({ delay: null })
    render(<RegisterForm next="/" />)

    await fillCommon(user)
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'alan',
        email: 'alan@example.com',
        password: 'MiPass123',
      }),
    )
  })

  it('muestra toast de bienvenida tras el registro', async () => {
    const user = userEvent.setup({ delay: null })
    render(<RegisterForm next="/" />)

    await fillCommon(user)
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(toastMock.success).toHaveBeenCalled()
  })

  it('redirige tras el registro', async () => {
    const user = userEvent.setup({ delay: null })
    render(<RegisterForm next="/account" />)

    await fillCommon(user)
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(mockReplace).toHaveBeenCalledWith('/account')
  })

  it('muestra el error del servidor sin redirigir', async () => {
    mockRegister.mockRejectedValue(new Error('El correo ya está registrado.'))
    const user = userEvent.setup({ delay: null })
    render(<RegisterForm next="/account" />)

    await fillCommon(user)
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/correo ya está registrado/i)).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})