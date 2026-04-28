import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import './exercises.css'
import { CiSearch } from "react-icons/ci";
import { TfiFaceSad } from "react-icons/tfi";
import ExerciseCard from '../components/Exercise';
import { useNavigate } from 'react-router-dom';


export default function Exercises() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [exercises, setExercises] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const query = searchQuery.trim().toLowerCase()

  const filteredExercises = exercises.filter(e => {
    const matchesLevel =
      filter === 'all' || e.level === filter

    const name = e.name?.toLowerCase() || ''
    const muscles = e.muscles?.toLowerCase() || ''

    const matchesSearch =
      name.includes(query) || muscles.includes(query)

    return matchesLevel && matchesSearch
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/exercises');
        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }
        const result = await response.json();
        setExercises(result);
      } catch (err) {
        setExercises(null);
      }
    }

    fetchData()

  }, [])

  return (
    <div>
      <Navbar />
      <div className='headers'>
        <h1>Exercise Library</h1>
        <h2>Choose an exercise to start training with real-time AI feedback</h2>
      </div>
      <div className="controls">
        <div className="search-wrapper">
          <div className="search-input">
            <CiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search exercises or muscle groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
          <div className="wk-form__field">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{fontSize:'1.5rem', padding:'12px 16px', borderRadius:'0.75rem;'}}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
      </div>
      <div className="exercises">
        {filteredExercises.length >= 1 ? filteredExercises?.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} onClick={() => navigate(`/exercises/${exercise.id}`)} />
        )) : <h2 style={{ marginTop: '4em' }}>Sorry! No Exercises Found <TfiFaceSad /></h2>}
      </div>
    </div>
  )
}
