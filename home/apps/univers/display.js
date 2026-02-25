//import {Crab} from "./components/crab.js"
//import {Bubble} from "./components/boule.js"
 import {Ball} from "./components/ball.js"
// import {Grain} from "./components/grain.js"
// import {Can} from "./components/can.js"
import {Galaxy} from "./components/Galaxy.js"

import {SolarSystem} from "./components/SolarSystem.js"
import {Dot} from "./components/WhiteDot.js"


export const univers = new p5(sketch => {
    sketch.name = "univers"
    sketch.activated = false

    let galaxie;
    let circles = [];
    //let solarsystemMouse;
    //let tabColor = [[128, 128, 128], [250, 240, 180], [0, 127, 255], [178, 46, 32], [255, 175, 0], [255, 255, 0], [147, 184, 190], [75, 112, 221]];//i want to put some different color for every planets but it doesnt work
    //let bubbles = [];
    let SolSyst = [];
    let balls = [];

    let max_ball = 6;
    let ball_nb;
    let previous_ball_nb = max_ball;

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height, sketch.WEBGL).position(0, 0);

        for(let i=0; i<max_ball; i++)
        {
            let b=new Ball(-500, -500)
            balls.push(b)
        }

        socket.on("ball", data => sketch.update_data(data));
        sketch.activated = true
        
        //slider = createSlider(0.25, 2, 0.1,0.2);
        //slider.position(10, 10);
        //slider.style('width', '80px');
        galaxie = new Galaxy(4000);
        
        
        for (let i = 0; i < 2000; i++){
            let x = random(width);
            let y = random(height);
            let dot = new Dot(x,y);
            circles.push(dot);
        }

        // for (let i = 0; i < 3; i++){
        //     let x = random(width);
        //     let y = random(height);
        //     let bubble = new Bubble(x,y);
        //     bubbles.push(bubble);
        // }

       

    }
//je peux faire update data apres avoir donné les coordonnées des boules au SS?
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
        SolSyst = [];
        for (let i=0; i<ball_nb;i++){
            let solsyst = new SolarSystem(balls[i].x, balls[i].y);
            SolSyst.push(solsyst);
        }
    }

    //faire fonction qui determine si la boule a bougé 

    sketch.resume = () => {};
    sketch.pause  = () => {};
    sketch.update = () => {
        sketch.update_data();
    };

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        sketch.push();
        
        for(let dot of circles){
            dot.show(sketch);
        }
    
        sketch.noFill();
        sketch.stroke(255);
        galaxie.moveGalaxy(sketch);
        
        for (let solsyst of SolSyst) {
        solsyst.display(sketch);
        }

        sketch.pop();
    };
});