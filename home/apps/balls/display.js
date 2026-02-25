import {
    Balls
} from "./components/balls.js";

export const balls = new p5((sketch) => {
    sketch.name = "balls";
    sketch.activated = false;

    let balls = new Balls();
    let fps = "30.00";
    let f;

    sketch.preload = () => {
        f = loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;

        socket.on("applications_balls_positions", (data) => balls.update_data(data));
        socket.on("fps", (data) => (fps = data));
        // sketch.emit = (name, data = undefined) => {
        //     if (data == undefined) socket.emit(name);
        //     else socket.emit(name, data);
        // };
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
        balls.show(sketch);

        sketch.push();
        sketch.translate(width/2 + 400, height + 10)
        sketch.rotate(PI)
        sketch.textFont(f);
        sketch.textSize(32);
        sketch.fill(255, 255, 255);
        sketch.text(`Ball detection : ${Math.round(fps)} FPS`, 0, 0);
        sketch.pop();
    };
});
