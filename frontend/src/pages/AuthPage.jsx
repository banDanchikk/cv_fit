import React, { useState } from 'react'
import './AuthPage.css'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [mode, setMode] = useState('login')
  const [passWrdSeen, setPassWrdSeen] = useState(false)
  const [repPassWrdSeen, setRepPassWrdSeen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', repeatPassword: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (mode === 'register') {
      if (!formData.username) return setError('Username is required')
      if (formData.password !== formData.repeatPassword)
        return setError('Passwords do not match')
    }
    if (!formData.email || !formData.password)
      return setError('Please fill all fields')

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password }

      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Something went wrong')
        return
      }

      login(data.token, { id: data.user_id, username: data.username })
      navigate('/')
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{mode === 'login' ? 'Log In' : 'Sign Up'}</h2>

        <button className="google-btn">
          <FcGoogle className="google-icon" />
          Continue with Google
        </button>

        {mode === 'register' && (
          <div className="input-field">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Your name"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="input-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-field">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passWrdSeen ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <span className="eye-icon" onClick={() => setPassWrdSeen(!passWrdSeen)}>
              {passWrdSeen ? <FaRegEyeSlash /> : <FaRegEye />}
            </span>
          </div>
        </div>

        {mode === 'register' && (
          <div className="input-field">
            <label>Repeat password</label>
            <div className="password-wrapper">
              <input
                type={repPassWrdSeen ? "text" : "password"}
                name="repeatPassword"
                placeholder="••••••••"
                value={formData.repeatPassword}
                onChange={handleChange}
              />
              <span className="eye-icon" onClick={() => setRepPassWrdSeen(!repPassWrdSeen)}>
                {repPassWrdSeen ? <FaRegEyeSlash /> : <FaRegEye />}
              </span>
            </div>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button className="main-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : mode === 'login' ? 'Log In' : 'Create account'}
        </button>

        <p className="switch-text">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <span className="switch-link" onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
          }}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  )
}