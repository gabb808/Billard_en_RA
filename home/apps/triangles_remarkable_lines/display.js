import {
    Balls
} from "./components/balls.js";


export const triangles_remarkable_lines = new p5((sketch) => {
    sketch.name = "triangles_remarkable_lines";
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

        socket.on("ball", (data) => balls.update_data(data));
        // socket.on("cue", (data) => l.update_data(data));
        // socket.on("fps", (data) => (fps = data));
        sketch.emit = (name, data = undefined) => {
            if (data == undefined) socket.emit(name);
            else socket.emit(name, data);
        };
        sketch.activated = true;
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

        // sketch.push();
        // sketch.textFont(f);
        // sketch.textSize(32);
        // sketch.fill(255, 255, 255);
        // sketch.text(`Ball Detection: ${fps} FPS`, -150, -150);
        // sketch.pop();
    };
});
