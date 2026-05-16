import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AuthPage from '../pages/AuthPage'
import { AuthProvider } from '../AuthContext'

beforeEach(() => {
    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ token: 'test-token', user_id: 1, username: 'testuser' })
        })
    )
})

afterEach(() => {
    vi.clearAllMocks()
})

const Wrapper = ({ children }) => (
    <AuthProvider><MemoryRouter>{children}</MemoryRouter></AuthProvider>
)

test('показує форму логіну за замовчуванням', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument()
})

test('перемикається на реєстрацію', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Sign Up'))
    expect(screen.getByText('Create account')).toBeInTheDocument()
})

test('показує помилку якщо паролі не співпадають', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Sign Up'))

    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'User' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } })

    const passwords = screen.getAllByPlaceholderText('••••••••')
    fireEvent.change(passwords[0], { target: { value: 'pass123' } })
    fireEvent.change(passwords[1], { target: { value: 'different' } })

    fireEvent.click(screen.getByText('Create account'))
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
})

test('показує помилку якщо поля порожні', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))
    expect(screen.getByText('Please fill all fields')).toBeInTheDocument()
})

test('перемикається назад на логін', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Sign Up'))
    fireEvent.click(screen.getByText('Log In'))
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument()
})

test('показує і ховає пароль', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.click(document.querySelector('.eye-icon'))
    expect(input).toHaveAttribute('type', 'text')
})

test('відправляє форму логіну', async () => {
    render(<AuthPage />, { wrapper: Wrapper })

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))

    expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/auth/login',
        expect.objectContaining({ method: 'POST' })
    )
})

test('відправляє форму реєстрації', async () => {
    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Sign Up'))

    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'User' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@test.com' } })

    const passwords = screen.getAllByPlaceholderText('••••••••')
    fireEvent.change(passwords[0], { target: { value: 'pass123' } })
    fireEvent.change(passwords[1], { target: { value: 'pass123' } })

    fireEvent.click(screen.getByText('Create account'))

    expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/auth/register',
        expect.objectContaining({ method: 'POST' })
    )
})

test('показує помилку якщо сервер повертає помилку', async () => {
    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ detail: 'Invalid credentials' })
        })
    )

    render(<AuthPage />, { wrapper: Wrapper })

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'wrongpass' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))

    await screen.findByText('Invalid credentials')
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
})

test('показує помилку при помилці з\'єднання', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

    render(<AuthPage />, { wrapper: Wrapper })

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@test.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))

    await screen.findByText('Connection error')
    expect(screen.getByText('Connection error')).toBeInTheDocument()
})