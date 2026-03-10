from core.application import BaseApplication


class Application(BaseApplication):
    """Vector path exercise.

    Relays the detected balls to the display application.
    The gameplay and scoring are handled client-side in display.js.
    """

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["ball"] = ["balls", "fps"]

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source != "ball" or data is None:
            return

        if event == "balls":
            self.server.send_data(f"{self.name}-balls", data)
        elif event == "fps":
            self.server.send_data(f"{self.name}-fps", data)