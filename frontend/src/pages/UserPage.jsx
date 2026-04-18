import Navbar from '../components/Navbar';
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import './UserPage.css';
import { useAuth } from '../AuthContext'
const navigate = useNavigate()

const USER_ID = 1;

export default function UserPage() {
    const { user, logout } = useAuth()
    const [user] = useState({ username: 'Danylo', email: 'danylo@gmail.com' })
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({ username: user.username, email: user.email })
    const [stats, setStats] = useState(null)
    const [chartMode, setChartMode] = useState('duration') 
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/workout_sessions/stats/${USER_ID}`)
            .then(r => r.json())
            .then(setStats)
    }, [])

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

    // Календар
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

    return (
        <>
            <Navbar />
            <div className="user-page">

                <div className="user-card">
                    <div className="user-avatar">
                        {formData.username?.[0]?.toUpperCase()}
                    </div>
                    {editing ? (
                        <div className="user-edit-form">
                            <input
                                value={formData.username}
                                onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                                placeholder="Username"
                            />
                            <input
                                value={formData.email}
                                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                placeholder="Email"
                            />
                            <div className="user-edit-actions">
                                <button className="main-btn" onClick={() => setEditing(false)}>Save</button>
                                <button className="outline-btn" onClick={() => setEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="user-info">
                            <h2>{formData.username}</h2>
                            <p>{formData.email}</p>
                            <button className="outline-btn" onClick={() => setEditing(true)}>Edit profile</button>
                        </div>
                    )}
                    <button onClick={handleLogout}>Log Out</button>
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
        </>
    )
}