import mediapipe as mp

class PoseDetector:
    def __init__(self):
        self.pose = mp.solutions.pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def process(self, image_rgb):
        return self.pose.process(image_rgb)
