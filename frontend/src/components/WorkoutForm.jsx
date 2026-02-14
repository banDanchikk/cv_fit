import { useEffect, useState } from 'react'
import './WorkoutForm.css'

export default function WorkoutForm({
  initialData,
  onSubmit,
  onCancel
}) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState('beginner')
  const [muscle, setMuscle] = useState('all')
  const [selectedExercises, setSelectedExercises] = useState([])
  const [exercises, setExercises] = useState([])

  const muscleOptions = [
    'all',
    ...Array.from(
      new Set(
        exercises.flatMap(ex =>
          ex.muscles
            ?.split(',')
            .map(m => m.trim())
        )
      )
    )
  ]

  const filteredExercises = exercises.filter(ex => {
    const exMuscles = ex.muscles ?? ''
    return !muscle || muscle === 'all' || exMuscles.toLowerCase().includes(muscle.toLowerCase())
  })

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '')
      setLevel(initialData.level ?? 'beginner')
      setSelectedExercises(initialData.exercises ?? [])
    }
  }, [initialData])

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
        setExercises([]);
      }
    }

    fetchData()

  }, [])

  const toggleExercise = (exercise) => {
    setSelectedExercises(prev =>
      prev.some(e => e.id === exercise.id)
        ? prev.filter(e => e.id !== exercise.id)
        : [...prev, exercise]
    )
  }

  const isSelected = (id) =>
    selectedExercises.some(e => e.id === id)

  const handleSubmit = (e) => {
    e.preventDefault()

    const exercisesData = selectedExercises.map(exercise => {
      if (initialData?.exercises) {
        const existingExercise = initialData.exercises.find(
          ex => ex.id === exercise.id || ex.exercise_id === exercise.id
        )

        if (existingExercise) {
          return {
            exercise_id: exercise.id,
            sets: existingExercise.sets || 3,
            reps: existingExercise.reps || 10
          }
        }
      }

      return {
        exercise_id: exercise.id,
        sets: 3, 
        reps: 10
      }
    })

    onSubmit({
      name: name.trim(),
      level,
      exercises: exercisesData
    })
  }

  return (
    <form onSubmit={handleSubmit} className="wk-form">

      <div className="wk-form__field">
        <label>Name</label>
        <input
          type="text"
          value={name}
          placeholder="Workout name"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="wk-form__field">
        <label>Level</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="wk-form__field">
        <div className="wk-form__filter">
          <label>Exercises</label>
          <select
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
          >
            {muscleOptions.map(m => (
              <option key={m} value={m}>
                {m === 'all' ? 'All muscles' : m}
              </option>
            ))}
          </select>
        </div>
        <div className="wk-exercise-grid">
          {filteredExercises.map(ex => (
            <div
              key={ex.id}
              className={`wk-exercise-card ${isSelected(ex.id) ? 'selected' : ''
                }`}
              onClick={() => toggleExercise(ex)}
            >
              <img src={ex.gif_url} alt={ex.name} />
              <span>{ex.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wk-form__actions">
        {onCancel && (
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="primary">
          Save
        </button>
      </div>

    </form>
  )
}
