class ExerciseBase:
    def __init__(self):
        self.counter = 0
        self.stage = None

    def reset(self):
        self.counter = 0
        self.stage = None

    def process(self, landmarks):
        raise NotImplementedError
