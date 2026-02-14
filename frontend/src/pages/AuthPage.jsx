import React, { useState } from 'react'
import './AuthPage.css'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [passWrdSeen, setPassWrdSeen] = useState(false)
  const [repPassWrdSeen, setRepPassWrdSeen] = useState(false)

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2>{mode === 'login' ? 'Log In' : 'Sign Up'}</h2>

        <button className="google-btn">
          <FcGoogle className="google-icon" />
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        {mode === 'register' && (
          <div className="input-field">
            <label>Username</label>
            <input type="text" placeholder="Your name" />
          </div>
        )}

        <div className="input-field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" />
        </div>

        <div className="input-field">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passWrdSeen ? "text" : "password"}
              placeholder="••••••••"
            />
            <span
              className="eye-icon"
              onClick={() => setPassWrdSeen(!passWrdSeen)}
            >
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
                placeholder="••••••••"
              />
              <span
                className="eye-icon"
                onClick={() => setRepPassWrdSeen(!repPassWrdSeen)}
              >
                {repPassWrdSeen ? <FaRegEyeSlash /> : <FaRegEye />}
              </span>
            </div>
          </div>
        )}

        <button className="main-btn">
          {mode === 'login' ? 'Log In' : 'Create account'}
        </button>

        {mode === 'login' && (
          <a className="link" href="#">Forgot password?</a>
        )}

        <p className="switch-text">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <span
            className="switch-link"
            onClick={() =>
              setMode(mode === 'login' ? 'register' : 'login')
            }
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </span>
        </p>

      </div>
    </div>
  )
}
