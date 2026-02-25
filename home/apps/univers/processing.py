from core.application import BaseApplication
import time

class Application(BaseApplication):
    """univers"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["ball"] = ["balls", "fps"]
        self.time = 0

    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "ball" and data is not None:
            if event == "balls": 
                #print(data)
                self.server.send_data("ball", data)
            # if event == "fps"  : self.server.send_data("fps",  data)
            # if event == "cue_data": self.server.send_data("cue", data)