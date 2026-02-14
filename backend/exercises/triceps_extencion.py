from ai.angle import calculate_angle
import mediapipe as mp
from .base import ExerciseBase

mp_pose = mp.solutions.pose

class TricepsExtencion(ExerciseBase):
    def process(self, landmarks):
        
        sl = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        sr = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        hl = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        hr = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        el = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
        er = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
        wl = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
        wr = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

        left_shoulder_angle = calculate_angle([hl.x,hl.y],[sl.x,sl.y],[el.x,el.y]) 
        right_shoulder_angle = calculate_angle([hr.x,hr.y],[sr.x,sr.y],[er.x,er.y])
        left_elbow_angle = calculate_angle([sl.x,sl.y],[el.x,el.y],[wl.x,wl.y])
        right_elbow_angle = calculate_angle([sr.x,sr.y],[er.x,er.y],[wr.x,wr.y])

        shoulder_angle = (left_shoulder_angle + right_shoulder_angle)/2
        elbow_angle = (left_elbow_angle + right_elbow_angle)/2

        if elbow_angle < 90 and shoulder_angle > 160:
            self.stage = 'down'
        
        if self.stage == 'down' and shoulder_angle > 160 and elbow_angle > 150:
            self.stage = 'up'
            self.counter += 1 


        return self.counter, self.stage