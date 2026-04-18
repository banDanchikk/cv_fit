import React from 'react'
import './navbar.css'
import Logo from '../assets/logo.png'
import { RiHome2Line } from "react-icons/ri";
import { CgGym } from "react-icons/cg";
import { LuNotepadText } from "react-icons/lu";
import { RiAccountCircleLine } from "react-icons/ri";
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../AuthContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/auth')
    }

    return (
        <div className='main'>
            <NavLink to='/' style={{ textDecoration: 'none' }}>
                <div className="title">
                    <div className="logo">
                        <img className='image-logo' src={Logo} alt="Logo" />
                    </div>
                    <h1>CVFit</h1>
                </div>
            </NavLink>
            <div className="pages">
                <NavLink to='/' style={{ textDecoration: 'none' }}>
                    <div className="page">
                        <RiHome2Line className='image' />
                        <h2>Home</h2>
                    </div>
                </NavLink>
                <NavLink to='/exercises' style={{ textDecoration: 'none' }}>
                    <div className="page">
                        <CgGym className='image' />
                        <h2>Exercises</h2>
                    </div>
                </NavLink>
                <NavLink to='/workouts' style={{ textDecoration: 'none' }}>
                    <div className="page">
                        <LuNotepadText className='image' />
                        <h2>Workouts</h2>
                    </div>
                </NavLink>

                {!user ? (
                    <NavLink to='/auth' style={{ textDecoration: 'none' }}>
                        <div className="auth-btn">Sign in</div>
                    </NavLink>
                ) : (
                    <>
                        <NavLink to='/account' style={{ textDecoration: 'none' }}>
                            <div className="page">
                                <RiAccountCircleLine className='image' />
                                <h2>Account</h2>
                            </div>
                        </NavLink>
                    </>
                )}
            </div>
        </div>
    )
}