import cv2
from fastapi import APIRouter, HTTPException
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

router = APIRouter(prefix="/video", tags=["Video"])

detector = PoseDetector()

EXERCISES = {
    "biceps-curl": BicepsCurl,
    "shoulder-press": ShoulderPress,
    "triceps-extencion": TricepsExtencion,
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
}

def generate_frames(exercise_name: str):
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        raise RuntimeError("Camera not available")

    exercise = EXERCISES[exercise_name]()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = detector.process(rgb)

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark

                draw_skeleton(frame, results.pose_landmarks)
                # draw_debug_angles(frame, landmarks)

                counter, stage = exercise.process(landmarks)
                draw_counter(frame, counter, stage)

            _, buffer = cv2.imencode(".jpg", frame)

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" +
                buffer.tobytes() +
                b"\r\n"
            )
    finally:
        cap.release()

@router.get("/{exercise_name}")
def video_stream(exercise_name: str):
    if exercise_name not in EXERCISES:
        raise HTTPException(status_code=404, detail="Exercise not found")

    return StreamingResponse(
        generate_frames(exercise_name),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )