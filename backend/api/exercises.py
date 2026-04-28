from fastapi import APIRouter, Query, HTTPException, Depends
from mySQL_connect import get_db
from mySQL_connect import get_cursor
from api.auth import get_current_user

router = APIRouter(
    prefix="/exercises",
    tags=["Exercises"]
)

@router.get("/")
def get_exercises():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM exercises")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


@router.get("/{exercise_id}")
def get_exercise_by_id(exercise_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM exercises WHERE id = %s",
            (exercise_id,)
        )
        exercise = cursor.fetchone()
        if not exercise:
            raise HTTPException(404, "Exercise not found")
        return exercise
    finally:
        cursor.close()
        conn.close()

@router.get("/stats/{exercise_id}")
def get_exercise_progress(exercise_id: int, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM exercise_progress WHERE exercise_id = %s AND user_id = %s",
            (exercise_id, user["user_id"])
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@router.get("/{exercise_id}/stats")
def get_exercise_training_stats(exercise_id: int, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                DATE(wsess.started_at) as date,
                MAX(ws.weight) as max_weight,
                SUM(ws.weight * ws.reps) as volume
            FROM workout_sets ws
            JOIN workout_sessions wsess ON ws.session_id = wsess.id
            WHERE ws.exercise_id = %s AND wsess.user_id = %s
            GROUP BY DATE(wsess.started_at)
            ORDER BY date ASC
        """, (exercise_id, user["user_id"]))

        return {
            "exercise_id": exercise_id,
            "stats": cursor.fetchall()
        }
    finally:
        cursor.close()
        conn.close()

@router.delete("/workouts/{workout_id}/exercises/{exercise_id}")
def delete_exercise_from_workout(workout_id: int, exercise_id: int):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        DELETE FROM workout_exercises
        WHERE workout_id = %s AND exercise_id = %s
        """
        cursor.execute(query, (workout_id, exercise_id))
        conn.commit()

        return {"status": "deleted"}
    finally:
        cursor.close()
        conn.close()
