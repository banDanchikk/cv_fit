from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose


class PushUps(ExerciseBase):
    def process(self, landmarks):
        sl = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        el = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        wl = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]

        sr = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        er = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        wr = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        angle_l = calculate_angle(
            [sl.x, sl.y],
            [el.x, el.y],
            [wl.x, wl.y]
        )

        angle_r = calculate_angle(
            [sr.x, sr.y],
            [er.x, er.y],
            [wr.x, wr.y]
        )

        avg_elbow_angle = (angle_l + angle_r) / 2

        if self.stage is None:
            if avg_elbow_angle > 160:
                self.stage = "up"
            return self.counter, self.stage

        if avg_elbow_angle < 90 and self.stage == "up":
            self.stage = "down"

        if avg_elbow_angle > 160 and self.stage == "down":
            self.stage = "up"
            self.counter += 1

        return self.counter, self.stage
