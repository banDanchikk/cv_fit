import './exercise.css'

export default function ExerciseCard({ exercise, onClick }) {

  return (
    <div className="exercise-card" onClick = {onClick}>
      <div className="exercise-media">
        <img src={exercise.gif_url} alt={exercise.name} />
        <span className={`difficulty ${exercise.level.toLowerCase()}`}>
          {exercise.level}
        </span>
      </div>

      <div className="exercise-content">
        <h3 className="exercise-title">{exercise.name}</h3>

        <div className="muscles">
          {exercise.muscles.split(', ').map((muscle, index) => (
            <span key={index} className="muscle-tag">
              {muscle}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}