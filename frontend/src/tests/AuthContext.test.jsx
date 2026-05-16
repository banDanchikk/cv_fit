import { render, screen, fireEvent } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { MemoryRouter } from 'react-router-dom'

const TestComponent = () => {
    const { user, login, logout } = useAuth()
    return (
        <div>
            <span>{user ? user.username : 'no user'}</span>
            <button onClick={() => login('token123', { id: 1, username: 'testuser' })}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

test('початково немає юзера', () => {
    localStorage.clear()
    render(<AuthProvider><MemoryRouter><TestComponent /></MemoryRouter></AuthProvider>)
    expect(screen.getByText('no user')).toBeInTheDocument()
})

test('login встановлює юзера і зберігає токен', () => {
    render(<AuthProvider><MemoryRouter><TestComponent /></MemoryRouter></AuthProvider>)
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe('token123')
})

test('logout очищає юзера і токен', () => {
    render(<AuthProvider><MemoryRouter><TestComponent /></MemoryRouter></AuthProvider>)
    fireEvent.click(screen.getByText('Login'))
    fireEvent.click(screen.getByText('Logout'))
    expect(screen.getByText('no user')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
})