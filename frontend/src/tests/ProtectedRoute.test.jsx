import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../AuthContext'
import { useAuth } from '../AuthContext'
import { vi } from 'vitest'

vi.mock('../AuthContext', () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children
}))


const renderWithAuth = (user, loading = false) => {
    useAuth.mockReturnValue({ user, loading })
    return render(
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route path="/auth" element={<div>Auth Page</div>} />
                <Route path="/protected" element={
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                } />
            </Routes>
        </MemoryRouter>
    )
}

test('показує контент авторизованому юзеру', () => {
    renderWithAuth({ id: 1, username: 'test' })
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
})

test('редіректить неавторизованого на /auth', () => {
    renderWithAuth(null)
    expect(screen.getByText('Auth Page')).toBeInTheDocument()
})

test('показує loading поки перевіряється авторизація', () => {
    renderWithAuth(null, true)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
})