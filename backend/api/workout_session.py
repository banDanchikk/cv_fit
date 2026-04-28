from fastapi import APIRouter, HTTPException, Depends
from mySQL_connect import get_cursor
from pydantic import BaseModel
from typing import List
from mySQL_connect import get_db
from api.auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/workout_sessions",
    tags=["Workout Sessions"]
)

class SessionCreate(BaseModel):
    workout_id: int
    started_at: datetime

class SetLog(BaseModel):
    exercise_id: int
    set_number: int
    reps: int
    weight: float

class SessionFinish(BaseModel):
    sets: List[SetLog]
    ended_at: datetime

@router.post("/")
def create_session(session: SessionCreate, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM workouts WHERE id = %s", (session.workout_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Workout not found")

        cursor.execute(
            "INSERT INTO workout_sessions (workout_id, user_id, started_at) VALUES (%s, %s, %s)",
            (session.workout_id, user["user_id"], session.started_at)
        )
        conn.commit()
        return {"session_id": cursor.lastrowid, "workout_id": session.workout_id}
    finally:
        cursor.close()
        conn.close()

@router.post("/{session_id}/finish")
def finish_session(session_id: int, data: SessionFinish, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM workout_sessions WHERE id = %s AND user_id = %s",
            (session_id, user["user_id"])
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found")

        if data.sets:
            cursor.executemany(
                "INSERT INTO workout_sets (session_id, exercise_id, set_number, reps, weight) VALUES (%s, %s, %s, %s, %s)",
                [(session_id, s.exercise_id, s.set_number, s.reps, s.weight) for s in data.sets]
            )

        cursor.execute(
            "UPDATE workout_sessions SET ended_at = %s WHERE id = %s",
            (data.ended_at, session_id)
        )
        conn.commit()
        return {"message": "Session finished", "session_id": session_id}
    finally:
        cursor.close()
        conn.close()

@router.get("/{session_id}")
def get_session(session_id: int, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM workout_sessions WHERE id = %s AND user_id = %s",
            (session_id, user["user_id"])
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Session not found")
        return row
    finally:
        cursor.close()
        conn.close()

@router.delete("/{session_id}")
def delete_session(session_id: int, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("DELETE FROM workout_sets WHERE session_id = %s", (session_id,))
        cursor.execute(
            "DELETE FROM workout_sessions WHERE id = %s AND user_id = %s",
            (session_id, user["user_id"])
        )
        conn.commit()
        return {"message": "Session deleted"}
    finally:
        cursor.close()
        conn.close()

@router.get("/{session_id}/previous")
def get_previous_session(session_id: int, user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT workout_id FROM workout_sessions WHERE id = %s AND user_id = %s", (session_id, user["user_id"]))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Session not found")

        workout_id = row['workout_id']

        cursor.execute("""
            SELECT id FROM workout_sessions
            WHERE workout_id = %s AND ended_at IS NOT NULL AND id != %s AND user_id = %s
            ORDER BY started_at DESC LIMIT 1
        """, (workout_id, session_id, user["user_id"]))

        prev = cursor.fetchone()
        if not prev:
            return None

        cursor.execute("""
            SELECT COUNT(*) as total_sets, SUM(reps) as total_reps,
                   SUM(reps * weight) as total_volume,
                   TIMESTAMPDIFF(SECOND, ws.started_at, ws.ended_at) as duration
            FROM workout_sets wss
            JOIN workout_sessions ws ON ws.id = wss.session_id
            WHERE wss.session_id = %s
        """, (prev['id'],))

        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


@router.get("/stats/me")
def get_my_stats(user=Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT ws.id, ws.started_at, ws.ended_at, w.name,
                   TIMESTAMPDIFF(SECOND, ws.started_at, ws.ended_at) as duration,
                   COUNT(wss.id) as total_sets,
                   SUM(wss.reps) as total_reps
            FROM workout_sessions ws
            JOIN workouts w ON ws.workout_id = w.id
            LEFT JOIN workout_sets wss ON wss.session_id = ws.id
            WHERE ws.user_id = %s AND ws.ended_at IS NOT NULL
            GROUP BY ws.id, ws.started_at, ws.ended_at, w.name
            ORDER BY ws.started_at DESC
            LIMIT 5
        """, (user["user_id"],))
        recent = cursor.fetchall()

        cursor.execute("""
            SELECT DATE(started_at) as day
            FROM workout_sessions
            WHERE user_id = %s AND ended_at IS NOT NULL
            GROUP BY DATE(started_at)
        """, (user["user_id"],))
        days = [str(r['day']) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT 
                DATE(ws.started_at) as day,
                TIMESTAMPDIFF(SECOND, ws.started_at, ws.ended_at) as duration,
                SUM(wss.reps) as total_reps
            FROM workout_sessions ws
            LEFT JOIN workout_sets wss ON wss.session_id = ws.id
            WHERE ws.user_id = %s
              AND ws.ended_at IS NOT NULL
              AND MONTH(ws.started_at) = MONTH(NOW())
              AND YEAR(ws.started_at) = YEAR(NOW())
            GROUP BY ws.id, ws.started_at, ws.ended_at
            ORDER BY ws.started_at
        """, (user["user_id"],))
        chart_data = cursor.fetchall()

        return {"recent_sessions": recent, "workout_days": days, "chart_data": chart_data}
    finally:
        cursor.close()
        conn.close()