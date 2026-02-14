import cv2
from ai.pose_detector import PoseDetector
from ui.overlay import draw_skeleton, draw_counter
from exercises.biceps_curl import BicepsCurl
from exercises.shoulder_press import ShoulderPress

detector = PoseDetector()

current_exercise = ShoulderPress()

cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = detector.process(rgb)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        draw_skeleton(frame, results.pose_landmarks)

        counter, stage = current_exercise.process(landmarks)

        draw_counter(frame, counter, stage)

    cv2.imshow("AI Trainer", frame)

    if cv2.waitKey(10) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
