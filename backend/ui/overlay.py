import cv2
import mediapipe as mp
from ai.angle import calculate_angle

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

def draw_skeleton(image, landmarks):
    mp_drawing.draw_landmarks(
        image,
        landmarks,
        mp_pose.POSE_CONNECTIONS,
        mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
        mp_drawing.DrawingSpec(thickness=2)
    )

    

def draw_counter(image, counter, stage):
    cv2.rectangle(image, (0,0), (220,70), (0,0,0), -1)

    cv2.putText(image, "REPS", (10,15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)
    cv2.putText(image, str(counter), (10,55),
                cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 2)

    cv2.putText(image, "STAGE", (90,15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)
    cv2.putText(image, stage or "-", (90,55),
                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255,255,255), 2)

def draw_angle(image, a, b, c, angle, offset=(10, -10)):
    """
    a, b, c — landmarks
    angle — значення кута
    """
    x = int(b.x * image.shape[1])
    y = int(b.y * image.shape[0])

    cv2.putText(
        image,
        str(int(angle)),
        (x + offset[0], y + offset[1]),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        2
    )

def draw_debug_angles(image, landmarks):
    joints = [
        (
            mp_pose.PoseLandmark.LEFT_SHOULDER,
            mp_pose.PoseLandmark.LEFT_ELBOW,
            mp_pose.PoseLandmark.LEFT_WRIST,
        ),
        (
            mp_pose.PoseLandmark.RIGHT_SHOULDER,
            mp_pose.PoseLandmark.RIGHT_ELBOW,
            mp_pose.PoseLandmark.RIGHT_WRIST,
        ),
        # плечі
        (
            mp_pose.PoseLandmark.LEFT_HIP,
            mp_pose.PoseLandmark.LEFT_SHOULDER,
            mp_pose.PoseLandmark.LEFT_ELBOW,
        ),
        (
            mp_pose.PoseLandmark.RIGHT_HIP,
            mp_pose.PoseLandmark.RIGHT_SHOULDER,
            mp_pose.PoseLandmark.RIGHT_ELBOW,
        ),
        # таз
        (
            mp_pose.PoseLandmark.LEFT_SHOULDER,
            mp_pose.PoseLandmark.LEFT_HIP,
            mp_pose.PoseLandmark.LEFT_KNEE,
        ),
        (
            mp_pose.PoseLandmark.RIGHT_SHOULDER,
            mp_pose.PoseLandmark.RIGHT_HIP,
            mp_pose.PoseLandmark.RIGHT_KNEE,
        ),
        # коліна
        (
            mp_pose.PoseLandmark.LEFT_HIP,
            mp_pose.PoseLandmark.LEFT_KNEE,
            mp_pose.PoseLandmark.LEFT_ANKLE,
        ),
        (
            mp_pose.PoseLandmark.RIGHT_HIP,
            mp_pose.PoseLandmark.RIGHT_KNEE,
            mp_pose.PoseLandmark.RIGHT_ANKLE,
        ),
    ]

    for a_i, b_i, c_i in joints:
        a = landmarks[a_i.value]
        b = landmarks[b_i.value]
        c = landmarks[c_i.value]

        angle = calculate_angle(
            [a.x, a.y],
            [b.x, b.y],
            [c.x, c.y]
        )

        draw_angle(image, a, b, c, angle)