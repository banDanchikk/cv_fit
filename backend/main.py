from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.exercises import router as exercises_router
from api.video import router as video_router
from api.workouts import router as workouts_router
from api.workout_session import router as sessions_router


app = FastAPI(title="Workout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exercises_router)
app.include_router(video_router)
app.include_router(workouts_router)
app.include_router(sessions_router)