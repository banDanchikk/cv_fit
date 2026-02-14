from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose

class GluteBridge(ExerciseBase):
    def process(self, landmarks):
        hip_l = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        knee_l = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
        shoulder_l = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]

        hip_r = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        knee_r = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]
        shoulder_r = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]

        angle_l = calculate_angle([shoulder_l.x, shoulder_l.y], [hip_l.x, hip_l.y], [knee_l.x, knee_l.y])
        angle_r = calculate_angle([shoulder_r.x, shoulder_r.y], [hip_r.x, hip_r.y], [knee_r.x, knee_r.y])

        avg_angle = (angle_l + angle_r) / 2

        if avg_angle < 110:
            self.stage = "down"
        if avg_angle > 150 and self.stage == "down":
            self.stage = "up"
            self.counter += 1

        return self.counter, self.stage
