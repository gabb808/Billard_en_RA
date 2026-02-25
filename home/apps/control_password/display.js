export const control_password = new p5(( sketch ) => {
    sketch.name = "control_password"
    sketch.activated = false
    
    let control_password = "314159"

    sketch.set = (width, height, socket) => {
        

        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);
        
        sketch.emit = (name, data) => {
            socket.emit(name, data);
        }
        
        socket.on("control_password", data => {
            control_password = data["control_password"]
        })
        
        socket.emit("get_control_password")

        sketch.activated = true
    }

    sketch.windowResized = () => {
        // resizeCanvas(windowWidth, windowHeight);
    }

    sketch.pause = () => {
    }

    sketch.resume = () => {
    }

    sketch.update = () => {
    }

    sketch.show = () => {
        sketch.clear();
        sketch.textSize(32);
        sketch.fill(255, 255, 255);
        sketch.text(control_password, 100, 200)
    }
});