import HomePage from './pages/HomePage'
import Exercises from './pages/Exercises';
import Workouts from './pages/Workouts';
import WorkoutDetails from './pages/WorkoutDetails';
import ExerciseDetail from './pages/ExerciseDetail';
import WorkoutSession from './pages/WorkoutProces';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/exercises", element: <Exercises /> },
  { path: "/exercises/:id", element: <ExerciseDetail /> },
  { path: "/workouts", element: <Workouts /> },
  { path: "/workouts/:id", element: <WorkoutDetails /> },
  { path: "/workout-session/:id", element: <WorkoutSession /> },
  { path: "/account", element: <UserPage /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App