import {
    Balls
} from "./components/balls.js";

export const affine = new p5((sketch) => {
    sketch.name = "affine";
    sketch.activated = false;

    let balls = new Balls();
    // let fps = "30.00";
    let f;

    sketch.preload = () => {
        f = loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;

        socket.on("ball", (data) => balls.update_data(data));
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {
        balls.update();
    };

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        sketch.fill(0);
        balls.show(sketch, f);
    };
});
