from fastapi import APIRouter, Body, HTTPException, Depends
from mySQL_connect import get_cursor
from mySQL_connect import get_db
from pydantic import BaseModel
from typing import List
import logging
from api.auth import get_current_user

router = APIRouter(
    prefix="/workouts",
    tags=["Workouts"]
)

logger = logging.getLogger(__name__)


class WorkoutExercise(BaseModel):
    exercise_id: int
    sets: int
    reps: int 


class WorkoutCreate(BaseModel):
    name: str
    level: str
    exercises: List[WorkoutExercise]  


class WorkoutUpdate(BaseModel):
    name: str
    level: str
    exercises: List[WorkoutExercise]

class WorkoutExerciseUpdate(BaseModel):
    sets: int
    reps: int

@router.get("/")
def get_workouts(user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT * FROM workouts 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user["user_id"],))
        workouts = cursor.fetchall()

        for workout in workouts:
            cursor.execute("""
                SELECT e.id, e.name, e.level, e.muscles, e.gif_url,
                       we.sets, we.reps, we.created_at
                FROM workout_exercises we
                JOIN exercises e ON we.exercise_id = e.id
                WHERE we.workout_id = %s
                ORDER BY we.created_at
            """, (workout['id'],))
            workout['exercises'] = cursor.fetchall()

        return workouts
    finally:
        cursor.close()
        conn.close()

@router.get("/{workout_id}")
def get_workout(workout_id: int, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM workouts WHERE id = %s AND user_id = %s",
            (workout_id, user["user_id"])
        )
        workout = cursor.fetchone()
        if not workout:
            raise HTTPException(status_code=404, detail="Workout not found")

        cursor.execute("""
            SELECT e.id, e.name, e.level, e.muscles, e.gif_url,
                   we.sets, we.reps, we.created_at
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = %s
            ORDER BY we.created_at
        """, (workout_id,))
        workout['exercises'] = cursor.fetchall()

        return workout
    finally:
        cursor.close()
        conn.close()

@router.post("/")
def create_workout(workout: WorkoutCreate, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO workouts (name, level, user_id) VALUES (%s, %s, %s)",
            (workout.name, workout.level, user["user_id"])
        )
        workout_id = cursor.lastrowid

        if workout.exercises:
            cursor.executemany(
                "INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps) VALUES (%s, %s, %s, %s)",
                [(workout_id, ex.exercise_id, ex.sets, ex.reps) for ex in workout.exercises]
            )

        conn.commit()
        return {"id": workout_id, "name": workout.name, "level": workout.level}
    finally:
        cursor.close()
        conn.close()
        

@router.put("/{workout_id}")
def update_workout(workout_id: int, workout: WorkoutUpdate, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM workouts WHERE id = %s AND user_id = %s",
            (workout_id, user["user_id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Workout not found")

        cursor.execute(
            "UPDATE workouts SET name = %s, level = %s WHERE id = %s",
            (workout.name, workout.level, workout_id)
        )
        cursor.execute("DELETE FROM workout_exercises WHERE workout_id = %s", (workout_id,))

        if workout.exercises:
            cursor.executemany(
                "INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps) VALUES (%s, %s, %s, %s)",
                [(workout_id, ex.exercise_id, ex.sets, ex.reps) for ex in workout.exercises]
            )

        conn.commit()
        return {"id": workout_id, "name": workout.name, "level": workout.level}
    finally:
        cursor.close()
        conn.close()

@router.delete("/{workout_id}")
def delete_workout(workout_id: int, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("DELETE FROM workout_exercises WHERE workout_id = %s", (workout_id,))
        cursor.execute(
            "DELETE FROM workouts WHERE id = %s AND user_id = %s",
            (workout_id, user["user_id"])
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Workout not found")

        conn.commit()
        return {"message": "Workout deleted successfully"}
    finally:
        cursor.close()
        conn.close()

@router.put("/{workout_id}/exercises/{exercise_id}")
def update_workout_exercise(workout_id: int, exercise_id: int, data: WorkoutExerciseUpdate, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "UPDATE workout_exercises SET sets = %s, reps = %s WHERE workout_id = %s AND exercise_id = %s",
            (data.sets, data.reps, workout_id, exercise_id)
        )
        conn.commit()
        return {"status": "updated"}
    finally:
        cursor.close()
        conn.close()