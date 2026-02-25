export const live = new p5(( sketch ) => {
    sketch.name = "live"
    sketch.activated = false


    sketch.set = (width, height, socket) => {


        //sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);

        socket.on("ball", (data) => {
        });

        sketch.emit = (name, data) => {
            // socket.emit(name, data);
        }

        sketch.activated = false
    }

    sketch.windowResized = () => {
        //resizeCanvas(windowWidth, windowHeight);
    }

    sketch.pause = () => {
    }

    sketch.resume = () => {
    }

    sketch.update = () => {
    }

    sketch.show = () => {
    }
});