import {Rabbit} from "./components/rabbit.js"
import {Bubble} from "./components/bubble.js"

export const rabbits_game = new p5(sketch => {
    sketch.name = "rabbits_game"
    sketch.activated = false

    let rabbits = [];
    let balls = [];
    let max_ball = 20;
    let ball_nb;
    let previous_ball_nb = max_ball;

    sketch.preload = () => {
        //sable = loadImage('./platform/home/apps/sandtable/components/sable.jpg');
    }

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height, sketch.WEBGL).position(0, 0);

        for(let i=0; i<max_ball; i++)
        {
            let b=new Bubble(-500,- 500)
            balls.push(b)
        }
        socket.on("ball", data => sketch.update_data(data));
        sketch.activated = true
        
        for (var a = 0; a<16; a++) {
            let x = 0;
            let y = random(height);
            let r = random(40, 60);
            let state = true;
            let rabbit = new Rabbit(x, y, r,state);
            rabbits.push(rabbit);
        }
    }

    sketch.update_data = (data) => {
        if (data == undefined)  return;
        ball_nb = 0

        for (let b of data){
            if (ball_nb >= max_ball) break
                balls[ball_nb].x = b[0]
                balls[ball_nb].y = b[1]
                ball_nb += 1
        }
        for (let i = ball_nb; i< previous_ball_nb; i++)
        {
            balls[i].x = -500;
            balls[i].y = -500;
        }
        previous_ball_nb = ball_nb
    }

    sketch.resume = () => {};
    sketch.pause  = () => {};
    sketch.update = () => {
        sketch.update_data();
    };

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        sketch.push();
        sketch.push();
        sketch.pop();
        
        for (var i = 0; i<rabbits.length; i++) {
            for (let ball of balls) {
                if (dist(ball.x, ball.y, rabbits[i].x, rabbits[i].y)<(rabbits[i].getR()/2) + (ball.getR()/2)) {
                    if(rabbits[i].stateLife == true ){
                        rabbits[i].deathTime = millis();
                    }
                    rabbits[i].stateLife = false;
                }  
            } 
        } 
        for(let i=0; i<rabbits.length; i++){
            if(rabbits[i].stateLife == false && millis()-rabbits[i].deathTime >= 3000){
                rabbits[i].x = 0;
                rabbits[i].y = random(height);
                rabbits[i].stateLife = true;
                rabbits[i].alpha = 255;

            }
        }
        for(let i=0; i<rabbits.length; i++){
            rabbits[i].move();
            rabbits[i].show(sketch);
        }
        sketch.pop();
    };
});








