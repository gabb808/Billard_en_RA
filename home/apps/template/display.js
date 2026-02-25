// import {className} from "./components/file.js";

export const template = new p5((sketch) => {
    sketch.name = "template";
    sketch.activated = false;

    sketch.preload = () => {
        // Load assets (images, sounds, fonts, etc.)
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;
        // Set up your app here
        // socket.on("ball", (data) => balls.update_data(data));
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {};

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        //Draw here
    };
});
