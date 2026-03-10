from core.application import BaseApplication


class Application(BaseApplication):
    """vector_link

    Relay ball detector information to the display layer.
    The game logic is handled in display.js.
    """

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["ball"] = ["balls", "fps"]
        self.is_exclusive = True
        self.applications_allowed = ["menu", "show_hands", "balls"]
        self.applications_required = ["balls"]

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source != "ball" or data is None:
            return

        if event == "balls":
            self.server.send_data(f"{self.name}-balls", data)
        elif event == "fps":
            self.server.send_data(f"{self.name}-fps", data)