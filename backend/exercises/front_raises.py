from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose

class FrontRaises(ExerciseBase):
    def process(self, landmarks):
        sl = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        el = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        wl = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]

        sr = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        er = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        wr = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        angle_l = calculate_angle([sl.x, sl.y], [el.x, el.y], [wl.x, wl.y])

        angle_r = calculate_angle([sr.x, sr.y], [er.x, er.y], [wr.x, wr.y])

        elbows_straight = angle_l > 150 and angle_r > 150
        if (
            wl.y > sl.y and
            wr.y > sr.y and
            elbows_straight
        ):
            self.stage = "down"
        
        if (
            wl.y < sl.y and
            wr.y < sr.y and
            elbows_straight and
            self.stage == "down"
        ):
            self.stage = "up"
            self.counter += 1

        return self.counter, self.stage