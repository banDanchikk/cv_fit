import HomePage from './pages/HomePage'
import Exercises from './pages/Exercises';
import Workouts from './pages/Workouts';
import WorkoutDetails from './pages/WorkoutDetails';
import ExerciseDetail from './pages/ExerciseDetail';
import WorkoutSession from './pages/WorkoutProces';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage/>}/>
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/exercises/:id" element={<ExerciseDetail/>} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/:id" element={<WorkoutDetails/>}/>
          <Route path="/workout-session/:id" element={<WorkoutSession/>}/> 
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
