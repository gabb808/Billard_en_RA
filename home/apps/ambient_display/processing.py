from core.application import BaseApplication
import time

class Application(BaseApplication):
    """ambient_display"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["sensor_server"] = ["movements", "fps"]
        self.time = 0
        self.is_exclusive = True
        self.applications_allowed = ["menu", "show_hands", "balls"]
        self.applications_required = ["balls"]
        self.data = {}

    def listener(self, source, event, data):
        super().listener(source, event, data)
           
        if source == "sensor_server" and event == "movements" and data is not None:
            self.data = data
            self.server.send_data(self.name, self.data)
            print(data)