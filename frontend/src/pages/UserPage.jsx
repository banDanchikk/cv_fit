import Navbar from '../components/Navbar';
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import './UserPage.css';
import Modal from '../components/Modal'
import { MdEdit } from "react-icons/md"
import { RiLogoutBoxLine } from "react-icons/ri"
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router';

export default function UserPage() {
    const { user: authUser, logout, login } = useAuth()
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({ username: '', email: '' })
    const [stats, setStats] = useState(null)
    const [chartMode, setChartMode] = useState('duration')
    const [currentDate, setCurrentDate] = useState(new Date())

    const AVATAR_COLORS = [
        '#2563eb', '#7c3aed', '#db2777', '#ea580c',
        '#16a34a', '#0891b2', '#9333ea', '#dc2626'
    ]

    const getUserColor = (username) => {
        if (!username) return AVATAR_COLORS[0]
        const index = username.charCodeAt(0) % AVATAR_COLORS.length
        return AVATAR_COLORS[index]
    }

    const navigate = useNavigate()

    useEffect(() => {
        if (authUser) {
            setFormData({ username: authUser.username, email: authUser.email })
        }
    }, [authUser])

    useEffect(() => {
        if (!authUser) return
        fetch(`http://127.0.0.1:8000/workout_sessions/stats/${authUser.id}`)
            .then(r => r.json())
            .then(setStats)
    }, [authUser])

    const formatTime = (seconds) => {
        if (!seconds) return '0:00'
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${String(s).padStart(2, '0')}`
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }


    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return { firstDay: firstDay === 0 ? 6 : firstDay - 1, daysInMonth }
    }

    const { firstDay, daysInMonth } = getDaysInMonth(currentDate)
    const workoutDaysSet = new Set(stats?.workout_days || [])

    const calendarCells = []
    for (let i = 0; i < firstDay; i++) calendarCells.push(null)
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

    const chartData = (stats?.chart_data || []).map(d => ({
        day: new Date(d.day).getDate(),
        duration: d.duration ? Math.round(d.duration / 60) : 0,
        reps: d.total_reps || 0
    }))

    const handleLogout = () => {
        logout()
        navigate('/auth')
    }

    const handleSave = async () => {
        const token = localStorage.getItem('token')
        const res = await fetch('http://127.0.0.1:8000/auth/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            login(token, { ...authUser, ...formData })
        }
        setEditing(false)
    }

    return (
        <>
            <Navbar />
            <div className="user-page">

                <div className="user-card">
                    <div
                        className="user-avatar"
                        style={{ background: getUserColor(authUser?.username) }}
                    >
                        {authUser?.username?.[0]?.toUpperCase()}
                    </div>

                    <div className="user-info">
                        <h2>{authUser?.username}</h2>
                        <p>{authUser?.email}</p>
                    </div>

                    <div className="user-card-actions">
                        <button className="outline-btn" onClick={() => setEditing(true)}>
                            <MdEdit style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Edit profile
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <RiLogoutBoxLine style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Log out
                        </button>
                    </div>
                </div>

                <div className="user-content">

                    <div className="user-section">
                        <div className="section-header">
                            <h3>Workout calendar</h3>
                            <div className="cal-nav">
                                <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>‹</button>
                                <span>{currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>›</button>
                            </div>
                        </div>

                        <div className="calendar">
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                                <div key={d} className="cal-weekday">{d}</div>
                            ))}
                            {calendarCells.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} />
                                const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`
                                const hasWorkout = workoutDaysSet.has(dateStr)
                                const isToday = new Date().toISOString().slice(0, 10) === dateStr
                                return (
                                    <div
                                        key={day}
                                        className={`cal-day ${hasWorkout ? 'workout-day' : ''} ${isToday ? 'today' : ''}`}
                                    >
                                        {day}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="user-section">
                        <div className="section-header">
                            <h3>This month</h3>
                            <div className="chart-toggle">
                                <button
                                    className={chartMode === 'duration' ? 'active' : ''}
                                    onClick={() => setChartMode('duration')}
                                >Duration</button>
                                <button
                                    className={chartMode === 'reps' ? 'active' : ''}
                                    onClick={() => setChartMode('reps')}
                                >Reps</button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(val) => chartMode === 'duration' ? `${val} min` : `${val} reps`}
                                    labelFormatter={(l) => `Day ${l}`}
                                />
                                <Bar
                                    dataKey={chartMode}
                                    fill="#2563eb"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="user-section full-width">
                        <h3>Recent workouts</h3>
                        <div className="recent-list">
                            {(stats?.recent_sessions || []).map(s => (
                                <div key={s.id} className="recent-item">
                                    <div className="recent-info">
                                        <span className="recent-name">{s.name}</span>
                                        <span className="recent-date">{formatDate(s.started_at)}</span>
                                    </div>
                                    <div className="recent-stats">
                                        <span>{formatTime(s.duration)}</span>
                                        <span>{s.total_sets ?? 0} sets</span>
                                        <span>{s.total_reps ?? 0} reps</span>
                                    </div>
                                </div>
                            ))}
                            {!stats?.recent_sessions?.length && (
                                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2em' }}>No workouts yet</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit profile">
                <div className="user-edit-form">
                    <div className="input-field">
                        <label>Username</label>
                        <input
                            value={formData.username}
                            onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                            placeholder="Username"
                        />
                    </div>
                    <div className="input-field">
                        <label>Email</label>
                        <input
                            value={formData.email}
                            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                            placeholder="Email"
                        />
                    </div>
                    <div className="user-edit-actions">
                        <button className="main-btn" onClick={handleSave}>Save</button>
                        <button className="outline-btn" onClick={() => setEditing(false)} style={{ marginTop: '8px', fontWeight: 'bold' }}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </>
    )
}