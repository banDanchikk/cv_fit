import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import './WorkoutPage.css'
import { FiMoreVertical } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import WorkoutForm from '../components/WorkoutForm'

export default function Workouts() {
  const navigate = useNavigate()

  const [workouts, setWorkouts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState(null)

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/workouts')
      if (!response.ok) throw new Error('Fetch failed')
      const data = await response.json()
      setWorkouts(data)
    } catch {
      setWorkouts([])
    }
  }

  

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    setOpenMenuId(prev => (prev === id ? null : id))
  }

  useEffect(() => {
    const close = () => setOpenMenuId(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const openCreateModal = () => {
    setEditingWorkout(null)
    setModalOpen(true)
  }

  const openEditModal = (e, workout) => {
    e.stopPropagation()
    setEditingWorkout(workout)
    setModalOpen(true)
    setOpenMenuId(null)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()

    await fetch(`http://127.0.0.1:8000/workouts/${id}`, {
      method: 'DELETE'
    })

    setWorkouts(prev => prev.filter(w => w.id !== id))
    setOpenMenuId(null)
  }

  const handleSave = async (data) => {
    if (editingWorkout) {
      await fetch(`http://127.0.0.1:8000/workouts/${editingWorkout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } else {
      if (workouts.length >= 5) {
        error('You have reached the workout limit! Edit or delete existing workouts.')
        return
      }

      await fetch('http://127.0.0.1:8000/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    }

    setModalOpen(false)
    fetchWorkouts()
  }

  return (
    <div>
      <Navbar />

      <main>
        <div className="wk-container">
          <div className="wk-header">
            <h2>My Routines ({workouts.length}/5) {workouts.length == 5 ? <span>Limit reached!</span> : ""}</h2>

            <button className={`wk-add-btn${workouts.length >= 5 ? "disabled" : ""}`} onClick={openCreateModal} disabled={workouts.length >= 5 ? "disabled" : ""}>
              + New Routine
            </button>
          </div>

          {workouts.length === 0 && (
            <p className="wk-empty">You don’t have any routines yet.</p>
          )}

          <div className="wk-list">
            {workouts.map(w => (
              <div
                key={w.id}
                className="wk-el"
                onClick={() => navigate(`/workouts/${w.id}`)}
              >
                <div className="wk-info">
                  <h3>{w.name}</h3>
                  <span className="wk-meta">
                    {w.exercises.length} exercises • ~{w.exercises.reduce((sum, e) => sum + e.sets, 0)*4} min
                  </span>
                </div>

                <div className="wk-actions">
                  <button
                    className="wk-menu-btn"
                    onClick={(e) => toggleMenu(e, w.id)}
                  >
                    <FiMoreVertical />
                  </button>

                  {openMenuId === w.id && (
                    <div className="wk-dropdown">
                      <button onClick={(e) => openEditModal(e, w)}>
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={(e) => handleDelete(e, w.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWorkout ? 'Edit Workout' : 'New Workout'}
      >
        <WorkoutForm
          initialData={editingWorkout}
          onSubmit={handleSave}
        />
      </Modal>
    </div>
  )
}
