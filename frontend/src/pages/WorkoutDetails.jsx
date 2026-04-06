import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import Navbar from "../components/Navbar";
import "./WorkoutDetails.css";
import WorkoutBarChart from "../components/WorkoutBarChart";
import { FiMoreVertical } from 'react-icons/fi'
import Modal from '../components/Modal'
import WorkoutForm from '../components/WorkoutForm'
import { MdEdit } from "react-icons/md";
import { FaPlay } from "react-icons/fa";

export default function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate()

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [exData, setExData] = useState({ sets: null, reps: null })
  const [editingExercise, setEditingExercise] = useState(null)
  const [editWorkoutOpen, setEditWorkoutOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/workouts/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch workout");
        }

        const result = await response.json();
        setWorkout(result);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const close = () => setOpenMenuId(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    setOpenMenuId(prev => (prev === id ? null : id))
  }

  const openModal = (exercise) => {
    setEditingExercise(exercise)
    setExData({
      sets: exercise.sets,
      reps: exercise.reps
    })
    setModalOpen(true)
    setOpenMenuId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!editingExercise) return

    await fetch(
      `http://127.0.0.1:8000/workouts/${id}/exercises/${editingExercise.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(exData)
      }
    )

    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === editingExercise.id
          ? { ...ex, ...exData }
          : ex
      )
    }))

    setModalOpen(false)
    setEditingExercise(null)
  }

  const handleStartSession = async () => {
    const res = await fetch("http://127.0.0.1:8000/workout_sessions/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workout_id: workout.id })
    })

    const data = await res.json()
    navigate(`/workout-session/${data.session_id}`)
  }

  const handleDelete = async (e, exerciseId) => {
    e.stopPropagation()

    await fetch(
      `http://127.0.0.1:8000/workouts/${id}/exercises/${exerciseId}`,
      { method: "DELETE" }
    )

    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }))
  }

  if (loading) return <p>Loading...</p>;
  if (error || !workout) return <p>Workout not found</p>;

  return (
    <>
      <Navbar />

      <div className="workout-page">
        <div className="workout-header">
          <h1 className="workout-title">{workout.name}</h1>
          <button className="main-btn" style={{ fontSize: '1.5em' }} onClick={handleStartSession}><FaPlay style={{ marginRight: '1em' }} /> Start Workout</button>
        </div>

        <div className="wk-pg-content">
          <div className="wk-ex-list">
            {workout.exercises.map((e) => (
              <div className="wk-ex-element" key={e.id}>
                <img src={e.gif_url} alt={e.name} />

                <div className="lst-el-info">
                  <p className="ex-name">{e.name}</p>
                  <p className="ex-plans">{e.sets}x{e.reps}</p>
                </div>

                <button
                  className="wk-menu-btn"
                  onClick={(event) => toggleMenu(event, e.id)}
                >
                  <FiMoreVertical />
                </button>

                {openMenuId === e.id && (
                  <div className="wk-dropdown" style={{ top: "75px" }}>
                    <button onClick={() => openModal(e)}>
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={(event) => handleDelete(event, e.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="wk-stats">
            <div className="wk-stats-top">
              <div className="wk-author">
                <span className="label">Created by</span>
                <span className="author">Danylo</span>
              </div>

              <button className="edit-btn" onClick={() => setEditWorkoutOpen(true)}><MdEdit style={{ marginRight: '0.5em' }} />Edit workout</button>
            </div>

            <div className="wk-stats-content">
              <p className="wk-summary-title">Workout Summary</p>

              <div className="wk-summary-grid">
                <div className="wk-summary-item">
                  <span className="wk-summary-value">{workout.exercises.length}</span>
                  <span className="wk-summary-label">Exercises</span>
                </div>

                <div className="wk-summary-item">
                  <span className="wk-summary-value">
                    {workout.exercises.reduce((sum, e) => sum + e.sets, 0)}
                  </span>
                  <span className="wk-summary-label">Total sets</span>
                </div>

                <div className="wk-summary-item">
                  <span className="wk-summary-value">~{workout.exercises.reduce((sum, e) => sum + e.sets, 0) * 4}</span>
                  <span className="wk-summary-label">Duration (min)</span>
                </div>
              </div>

              <div className="muscle-parts">
                <WorkoutBarChart exercises={workout.exercises} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit exercise plan"
      >
        <form onSubmit={handleSubmit} className="wk-form">
          <div className="wk-form__field">
            <label>Sets</label>
            <input
              type="text"
              min="1"
              value={exData.sets}
              onChange={(e) =>
                setExData({ ...exData, sets: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="wk-form__field">
            <label>Reps</label>
            <input
              type="text"
              min="1"
              value={exData.reps}
              onChange={(e) =>
                setExData({ ...exData, reps: Number(e.target.value) })
              }
              required
            />
          </div>

          <button type="submit" className="primary">
            Save
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={editWorkoutOpen}
        onClose={() => setEditWorkoutOpen(false)}
        title="Edit Workout"
      >
        <WorkoutForm
          initialData={workout}
          onSubmit={async (data) => {
            await fetch(`http://127.0.0.1:8000/workouts/${workout.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })

            const res = await fetch(`http://127.0.0.1:8000/workouts/${workout.id}`)
            const updatedWorkout = await res.json()

            setWorkout(updatedWorkout)
            setEditWorkoutOpen(false)
          }}
        />

      </Modal>
    </>
  );
}
