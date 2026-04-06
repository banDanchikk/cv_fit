from fastapi import APIRouter, HTTPException
from mySQL_connect import mycursor, mydb
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/workout_sessions",
    tags=["Workout Sessions"]
)

class SessionCreate(BaseModel):
    workout_id: int

class SetLog(BaseModel):
    exercise_id: int
    set_number: int
    reps: int
    weight: float

class SessionFinish(BaseModel):
    sets: List[SetLog]

@router.post("/")
def create_session(session: SessionCreate):
    mycursor.execute("SELECT id FROM workouts WHERE id = %s", (session.workout_id,))
    if not mycursor.fetchone():
        raise HTTPException(status_code=404, detail="Workout not found")

    mycursor.execute(
        "INSERT INTO workout_sessions (workout_id, user_id, started_at) VALUES (%s, %s, NOW())",
        (session.workout_id, 1)
    )
    mydb.commit()

    return {"session_id": mycursor.lastrowid, "workout_id": session.workout_id}

@router.post("/{session_id}/finish")
def finish_session(session_id: int, data: SessionFinish):
    mycursor.execute("SELECT id FROM workout_sessions WHERE id = %s", (session_id,))
    if not mycursor.fetchone():
        raise HTTPException(status_code=404, detail="Session not found")

    if data.sets:
        mycursor.executemany(
            """INSERT INTO workout_sets (session_id, exercise_id, set_number, reps, weight)
               VALUES (%s, %s, %s, %s, %s)""",
            [(session_id, s.exercise_id, s.set_number, s.reps, s.weight) for s in data.sets]
        )

    mycursor.execute(
        "UPDATE workout_sessions SET ended_at = NOW() WHERE id = %s",
        (session_id,)
    )
    mydb.commit()

    return {"message": "Session finished", "session_id": session_id}

@router.get("/{session_id}")
def get_session(session_id: int):
    mycursor.execute("SELECT * FROM workout_sessions WHERE id = %s", (session_id,))
    row = mycursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Session not found")
    columns = [col[0] for col in mycursor.description]
    return dict(zip(columns, row))

@router.delete("/{session_id}")
def delete_session(session_id: int):
    mycursor.execute("DELETE FROM workout_sets WHERE session_id = %s", (session_id,))
    mycursor.execute("DELETE FROM workout_sessions WHERE id = %s", (session_id,))
    mydb.commit()
    return {"message": "Session deleted"}

@router.get("/{session_id}/previous")
def get_previous_session(session_id: int):
    mycursor.execute("SELECT workout_id FROM workout_sessions WHERE id = %s", (session_id,))
    row = mycursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Session not found")
    
    workout_id = row[0]

    mycursor.execute("""
        SELECT id FROM workout_sessions 
        WHERE workout_id = %s AND ended_at IS NOT NULL AND id != %s
        ORDER BY started_at DESC 
        LIMIT 1
    """, (workout_id, session_id))
    
    prev = mycursor.fetchone()
    if not prev:
        return None
    
    prev_session_id = prev[0]

    mycursor.execute("""
        SELECT 
            COUNT(*) as total_sets,
            SUM(reps) as total_reps,
            SUM(reps * weight) as total_volume,
            TIMESTAMPDIFF(SECOND, ws.started_at, ws.ended_at) as duration
        FROM workout_sets wss
        JOIN workout_sessions ws ON ws.id = wss.session_id
        WHERE wss.session_id = %s
    """, (prev_session_id,))
    
    row = mycursor.fetchone()
    columns = [col[0] for col in mycursor.description]
    return dict(zip(columns, row))