from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose

class BicepsCurl(ExerciseBase):
    def process(self, landmarks):
        sl = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        el = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        wl = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]

        sr = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        er = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        wr = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        angle_l = calculate_angle([sl.x,sl.y],[el.x,el.y],[wl.x,wl.y])
        angle_r = calculate_angle([sr.x,sr.y],[er.x,er.y],[wr.x,wr.y])

        if angle_l > 160 and angle_r > 160:
            self.stage = "down"

        if angle_l < 30 and angle_r < 30 and self.stage == "down":
            self.stage = "up"
            self.counter += 1

        return self.counter, self.stage