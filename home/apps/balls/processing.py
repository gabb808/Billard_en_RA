from core.application import BaseApplication
import time

class Application(BaseApplication):
    """balls"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["ball"] = ["balls", "fps"]
        self.time = 0

    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "ball" and data is not None:
            if event == "balls": self.server.send_data("applications_balls_positions", data)
            if event == "fps"  : self.server.send_data("fps",  data)
            # if event == "cue_data": self.server.send_data("cue", data)