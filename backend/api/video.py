import cv2
import base64
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse
from ui.overlay import draw_debug_angles
from ai.pose_detector import PoseDetector
from ui.overlay import draw_skeleton, draw_counter
from exercises.biceps_curl import BicepsCurl
from exercises.shoulder_press import ShoulderPress
from exercises.triceps_extencion import TricepsExtencion
from exercises.front_raises import FrontRaises
from exercises.lateral_raises import LateralRaises
from exercises.glute_bridge import GluteBridge
from exercises.squats import Squats
from exercises.pushups import PushUps
from exercises.calf_raices import CalfRaises
from exercises.bent_over_row import BentOverRow
from exercises.deadlift import Deadlift
from exercises.pull_ups import PullUps
from exercises.incline_bench_press import InclineBenchPress
from exercises.crunches import SitUps
from exercises.lunges import Lunges

router = APIRouter(prefix="/video", tags=["Video"])

detector = PoseDetector()

active_sessions = {}

EXERCISES = {
    "biceps-curl": BicepsCurl,
    "shoulder-press": ShoulderPress,
    "triceps-extensions": TricepsExtencion,
    "front-raises": FrontRaises,
    "lateral-raises": LateralRaises,
    "glute-bridge": GluteBridge,
    "squats": Squats,
    "push-ups": PushUps,
    "calf-raices": CalfRaises,
    "bent-over-row": BentOverRow,
    "deadlift": Deadlift,
    "pull-ups": PullUps,
    "incline-bench-press": InclineBenchPress,
    "sit-ups": SitUps,
    "lunges":Lunges,
}

@router.websocket("/workout/{exercise_name}")
async def workout_websocket(websocket: WebSocket, exercise_name: str):
    await websocket.accept()
    
    # Ініціалізуємо камеру всередині сокета
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        await websocket.close(code=1011) # Помилка сервера
        return

    # Отримуємо клас вправи
    exercise_class = EXERCISES.get(exercise_name)
    if not exercise_class:
        cap.release()
        await websocket.close(code=1003) # Неправильні дані
        return
        
    exercise = exercise_class()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # 1. Обробка кадру
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = detector.process(rgb)

            counter, stage = 0, "up"
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                draw_skeleton(frame, results.pose_landmarks)
                
                # Рахуємо повтори
                counter, stage = exercise.process(landmarks)
                draw_counter(frame, counter, stage)

            # 2. Кодуємо кадр у Base64 (щоб передати текстом через JSON)
            _, buffer = cv2.imencode(".jpg", frame)
            jpg_as_text = base64.b64encode(buffer).decode("utf-8")

            # 3. Надсилаємо JSON пакет
            await websocket.send_json({
                "image": jpg_as_text,
                "counter": counter,
                "stage": stage
            })

            # FPS Control (приблизно 30 кадрів на секунду)
            await asyncio.sleep(0.03)

    except WebSocketDisconnect:
        print(f"Клієнт від'єднався. Фінальний результат: {exercise.counter}")
    except Exception as e:
        print(f"Помилка: {e}")
    finally:

        cap.release()