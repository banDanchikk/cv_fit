from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose


class BentOverRow(ExerciseBase):
    def process(self, landmarks):

        # Left arm
        shoulder_l = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        elbow_l = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        wrist_l = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]

        # Right arm
        shoulder_r = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        elbow_r = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        wrist_r = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        # Torso
        hip_l = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        knee_l = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]
        hip_r = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        knee_r = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value]

        # Elbow angles
        elbow_angle_l = calculate_angle(
            [shoulder_l.x, shoulder_l.y],
            [elbow_l.x, elbow_l.y],
            [wrist_l.x, wrist_l.y]
        )

        elbow_angle_r = calculate_angle(
            [shoulder_r.x, shoulder_r.y],
            [elbow_r.x, elbow_r.y],
            [wrist_r.x, wrist_r.y]
        )

        avg_elbow_angle = (elbow_angle_l + elbow_angle_r) / 2

        shoulder_l_angle = calculate_angle(
            [hip_l.x, hip_l.y],
            [shoulder_l.x, shoulder_l.y],
            [elbow_l.x, elbow_l.y]
        )
        shoulder_r_angle = calculate_angle(
            [hip_r.x, hip_r.y],
            [shoulder_r.x, shoulder_r.y],
            [elbow_r.x, elbow_r.y]
        )
        avg_shoulder_angle = (shoulder_l_angle + shoulder_r_angle) / 2

        torso_angle_l = calculate_angle(
            [shoulder_l.x, shoulder_l.y],
            [hip_l.x, hip_l.y],
            [knee_l.x, knee_l.y]
        )
        torso_angle_r = calculate_angle(
            [shoulder_r.x, shoulder_r.y],
            [hip_r.x, hip_r.y],
            [knee_r.x, knee_r.y]
        )

        torso_angle = (torso_angle_l + torso_angle_r) / 2

        back_ok = 90 <= torso_angle <= 150
        if not back_ok:
            return self.counter, self.stage
        
        if avg_elbow_angle > 150 and avg_shoulder_angle > 30:
            self.stage = "down"

        if (
            avg_elbow_angle < 110 and
            avg_shoulder_angle < 60 and
            self.stage == "down"
        ):
            self.stage = "up"
            self.counter += 1

        return self.counter, self.stage