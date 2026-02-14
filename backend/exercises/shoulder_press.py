from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose

class ShoulderPress(ExerciseBase):
    def process(self, landmarks):
        elbow_left = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        shoulder_left = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        hip_left = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        wrist_left = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]

        elbow_right = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        shoulder_right = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        hip_right = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        wrist_right = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        left_shoulder_angle = calculate_angle([hip_left.x, hip_left.y], [shoulder_left.x, shoulder_left.y], [elbow_left.x, elbow_left.y])
        right_shoulder_angle = calculate_angle([hip_right.x, hip_right.y],[shoulder_right.x, shoulder_right.y], [elbow_right.x, elbow_right.y])
        left_elbow_angle = calculate_angle([shoulder_left.x, shoulder_left.y],[elbow_left.x, elbow_left.y],[wrist_left.x,wrist_left.y])
        right_elbow_angle =  calculate_angle([shoulder_right.x, shoulder_right.y],[elbow_right.x, elbow_right.y],[wrist_right.x,wrist_right.y])

        elbow_angle = (left_elbow_angle+right_elbow_angle)/2
        shoulder_angle = (left_shoulder_angle+right_shoulder_angle)/2

        if elbow_angle < 100 and shoulder_angle < 80:
            self.stage = "down"

        if (
            elbow_angle > 160 and
            shoulder_angle > 150 and
            self.stage == "down"
        ):
            self.stage = "up"
            self.counter += 1
        
        return self.counter, self.stage