from core.application import BaseApplication
import socketio

class Application(BaseApplication):
    """live"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name,hal,server,manager)
        self.requires["ball"] = ["ball_data"]

        self.sio = socketio.Client()

        self.sio.connect("https://vps.thomasjuldo.com/", socketio_path="/realtimepool/socket.io")
        

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "ball" and event == "ball_data" and data is not None:
            self.data = data

            l= []
            for x,y in self.data:
                x/=1888
                y/=1049
                l.append([x,y])

            self.sio.emit("update_data",l)
