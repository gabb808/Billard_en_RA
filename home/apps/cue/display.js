import {Cue} from "./components/cue.js"

export const cue = new p5(( sketch ) =>{
    sketch.name = "cue"
    sketch.activated = false

    let cue = new Cue();
    let fps = "30.00";

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);
        socket.on("cue", data => cue.update_data(data));
        // socket.on("cue", (data) => l.update_data(data));
        socket.on("fps",  data => fps = data);
        sketch.emit = (name, data) => socket.emit(name, data);
        sketch.activated = true
    };

    sketch.resume = () => {

    };

    sketch.pause = () => {

    };

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    }

    sketch.update = () => {
        cue.update()
    }

    sketch.show = () => {
        sketch.clear();
        
        cue.show(sketch);
                
        sketch.textSize(32);
        sketch.fill(255, 255, 255);
        sketch.text(`DETECTION: ${fps} FPS`, 50, 90);
    };
});