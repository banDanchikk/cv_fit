from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose


class Deadlift(ExerciseBase):
    def process(self, landmarks):

        # === Точки ===
        shoulder_l = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        hip_l = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        knee_l = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
        ankle_l = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]

        shoulder_r = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        hip_r = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        knee_r = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
        ankle_r = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]

        # === Кути тазу ===
        hip_angle_l = calculate_angle(
            [shoulder_l.x, shoulder_l.y],
            [hip_l.x, hip_l.y],
            [knee_l.x, knee_l.y]
        )

        hip_angle_r = calculate_angle(
            [shoulder_r.x, shoulder_r.y],
            [hip_r.x, hip_r.y],
            [knee_r.x, knee_r.y]
        )

        avg_hip_angle = (hip_angle_l + hip_angle_r) / 2

        # === Кути колін ===
        knee_angle_l = calculate_angle(
            [hip_l.x, hip_l.y],
            [knee_l.x, knee_l.y],
            [ankle_l.x, ankle_l.y]
        )

        knee_angle_r = calculate_angle(
            [hip_r.x, hip_r.y],
            [knee_r.x, knee_r.y],
            [ankle_r.x, ankle_r.y]
        )

        avg_knee_angle = (knee_angle_l + knee_angle_r) / 2

        if avg_hip_angle < 100 and avg_knee_angle < 150:
            self.stage = "down"

        if (
            avg_hip_angle > 160 and
            avg_knee_angle > 165 and
            self.stage == "down"
        ):
            self.stage = "up"
            self.counter += 1

        return self.counter, self.stage
