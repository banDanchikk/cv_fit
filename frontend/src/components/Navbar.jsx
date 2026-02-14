import React, { useState } from 'react'
import './navbar.css'
import Logo from '../assets/logo.png'
import { RiHome2Line } from "react-icons/ri";
import { CgGym } from "react-icons/cg";
import { LuNotepadText } from "react-icons/lu";
import { RiAccountCircleLine } from "react-icons/ri";
import { NavLink } from 'react-router';


export default function Navbar() {
    const [isAuth, setIsAuth] = useState(false);

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

                {!isAuth ? (
                    <div className="auth-btn" onClick={() => setIsAuth(true)}>
                        Sign in
                    </div>
                ) : (
                    <div className="page">
                        <RiAccountCircleLine className='image' />
                        <h2>Account</h2>
                    </div>
                )}
            </div>
        </div>
    )
}
