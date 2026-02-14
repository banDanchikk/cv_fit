from fastapi import APIRouter, Body, HTTPException
from mySQL_connect import mycursor, mydb
from pydantic import BaseModel
from typing import List
import logging

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
def get_workouts():
        mycursor.execute("SELECT * FROM workouts ORDER BY created_at DESC")
        rows = mycursor.fetchall()
        columns = [col[0] for col in mycursor.description]
        workouts = [dict(zip(columns, row)) for row in rows]
        
        for workout in workouts:
            mycursor.execute("""
                SELECT e.id, e.name, e.level, e.muscles, e.gif_url, 
                       we.sets, we.reps, we.created_at
                FROM workout_exercises we
                JOIN exercises e ON we.exercise_id = e.id
                WHERE we.workout_id = %s
                ORDER BY we.created_at
            """, (workout['id'],))
            
            exercise_rows = mycursor.fetchall()
            exercise_columns = [col[0] for col in mycursor.description]
            workout['exercises'] = [
                dict(zip(exercise_columns, row)) 
                for row in exercise_rows
            ]
        
        return workouts

@router.get("/{workout_id}")
def get_workout(workout_id: int):
        mycursor.execute("SELECT * FROM workouts WHERE id = %s", (workout_id,))
        row = mycursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Workout not found")
        
        columns = [col[0] for col in mycursor.description]
        workout = dict(zip(columns, row))
        
        mycursor.execute("""
            SELECT e.id, e.name, e.level, e.muscles, e.gif_url, 
                   we.sets, we.reps, we.created_at
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = %s
            ORDER BY we.created_at
        """, (workout_id,))
        
        exercise_rows = mycursor.fetchall()
        exercise_columns = [col[0] for col in mycursor.description]
        workout['exercises'] = [
            dict(zip(exercise_columns, row)) 
            for row in exercise_rows
        ]
        
        return workout

@router.post("/")
def create_workout(workout: WorkoutCreate):
        mycursor.execute("START TRANSACTION")
        
        query = """
            INSERT INTO workouts (name, level)
            VALUES (%s, %s)
        """
        mycursor.execute(query, (workout.name, workout.level))
        workout_id = mycursor.lastrowid
        
        if workout.exercises:
            exercise_query = """
                INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps)
                VALUES (%s, %s, %s, %s)
            """
            
            exercise_values = [
                (workout_id, ex.exercise_id, ex.sets, ex.reps)
                for ex in workout.exercises
            ]
            
            mycursor.executemany(exercise_query, exercise_values)
        
        mydb.commit()
        
        return {
            "id": workout_id,
            "name": workout.name,
            "level": workout.level,
            "message": "Workout created successfully"
        }
        

@router.put("/{workout_id}")
def update_workout(workout_id: int, workout: WorkoutUpdate):
        mycursor.execute("SELECT id FROM workouts WHERE id = %s", (workout_id,))
        if not mycursor.fetchone():
            raise HTTPException(status_code=404, detail="Workout not found")
        
        mycursor.execute("START TRANSACTION")
        
        update_query = """
            UPDATE workouts
            SET name = %s, level = %s
            WHERE id = %s
        """
        mycursor.execute(update_query, (workout.name, workout.level, workout_id))
        
        delete_query = "DELETE FROM workout_exercises WHERE workout_id = %s"
        mycursor.execute(delete_query, (workout_id,))
        
        if workout.exercises:
            exercise_query = """
                INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps)
                VALUES (%s, %s, %s, %s)
            """
            
            exercise_values = [
                (workout_id, ex.exercise_id, ex.sets, ex.reps)
                for ex in workout.exercises
            ]
            
            mycursor.executemany(exercise_query, exercise_values)
        
        mydb.commit()
        
        return {
            "id": workout_id,
            "name": workout.name,
            "level": workout.level,
            "message": "Workout updated successfully"
        }

@router.delete("/{workout_id}")
def delete_workout(workout_id: int):
        mycursor.execute("START TRANSACTION")
        
        delete_exercises_query = "DELETE FROM workout_exercises WHERE workout_id = %s"
        mycursor.execute(delete_exercises_query, (workout_id,))
        
        delete_workout_query = "DELETE FROM workouts WHERE id = %s"
        mycursor.execute(delete_workout_query, (workout_id,))
        
        rows_affected = mycursor.rowcount
        
        if rows_affected == 0:
            raise HTTPException(status_code=404, detail="Workout not found")
        
        mydb.commit()
        
        return {"message": "Workout deleted successfully"}

@router.put("/{workout_id}/exercises/{exercise_id}")
def update_workout_exercise(
    workout_id: int,
    exercise_id: int,
    data: WorkoutExerciseUpdate
):
    query = """
        UPDATE workout_exercises
        SET sets = %s, reps = %s
        WHERE workout_id = %s AND exercise_id = %s
    """
    mycursor.execute(
        query,
        (data.sets, data.reps, workout_id, exercise_id)
    )
    mydb.commit()

    return {"status": "updated"}