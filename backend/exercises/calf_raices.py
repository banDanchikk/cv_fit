from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose


class CalfRaises(ExerciseBase):
    def process(self, landmarks):
        knee_l = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
        ankle_l = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
        foot_l = landmarks[mp_pose.PoseLandmark.LEFT_FOOT_INDEX.value]

        knee_r = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
        ankle_r = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
        foot_r = landmarks[mp_pose.PoseLandmark.RIGHT_FOOT_INDEX.value]

        angle_l = calculate_angle(
            [knee_l.x, knee_l.y],
            [ankle_l.x, ankle_l.y],
            [foot_l.x, foot_l.y]
        )

        angle_r = calculate_angle(
            [knee_r.x, knee_r.y],
            [ankle_r.x, ankle_r.y],
            [foot_r.x, foot_r.y]
        )

        avg_ankle_angle = (angle_l + angle_r) / 2

        if self.stage is None:
            if avg_ankle_angle < 110:
                self.stage = "down"
            return self.counter, self.stage

        if avg_ankle_angle > 125 and self.stage == "down":
            self.stage = "up"

        if avg_ankle_angle < 120 and self.stage == "up":
            self.stage = "down"
            self.counter += 1

        return self.counter, self.stage
