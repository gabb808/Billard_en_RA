from core.application import BaseApplication
import time

class Application(BaseApplication):
    """template"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["ball"] = ["balls"]
        self.time = 0

    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "ball" and data is not None:
            if event == "balls": self.server.send_data("ball", data)