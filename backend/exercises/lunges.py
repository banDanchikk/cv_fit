from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose

class Lunges(ExerciseBase):
    def process(self, landmarks):
        hl = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        kl = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
        al = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]

        hr = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        kr = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
        ar = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]

        angle_l = calculate_angle([hl.x, hl.y], [kl.x, kl.y], [al.x, al.y])
        angle_r = calculate_angle([hr.x, hr.y], [kr.x, kr.y], [ar.x, ar.y])

        if angle_l < 110 or angle_r < 110:
            if self.stage != "down":
                self.stage = "down"

        if angle_l > 160 and angle_r > 160 and self.stage == "down":
            self.stage = "up"
            self.counter += 1

        return self.counter, self.stage