import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { vi } from 'vitest'

vi.mock('../AuthContext', () => ({
    useAuth: vi.fn()
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router')
    return {
        ...actual,
        useNavigate: () => vi.fn()
    }
})

import { useAuth } from '../AuthContext'

const renderNavbar = (user) => {
    useAuth.mockReturnValue({ user, logout: vi.fn() })
    return render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    )
}

test('показує Sign in якщо не авторизований', () => {
    renderNavbar(null)
    expect(screen.getByText('Sign in')).toBeInTheDocument()
})

test('показує Account якщо авторизований', () => {
    renderNavbar({ id: 1, username: 'test' })
    expect(screen.getByText('Account')).toBeInTheDocument()
})

test('містить посилання на exercises', () => {
    renderNavbar(null)
    expect(screen.getByText('Exercises')).toBeInTheDocument()
})

test('містить посилання на workouts', () => {
    renderNavbar(null)
    expect(screen.getByText('Workouts')).toBeInTheDocument()
})