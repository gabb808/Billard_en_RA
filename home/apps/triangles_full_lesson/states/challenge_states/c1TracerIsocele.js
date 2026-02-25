import {
    audioMedia,
    navBar
} from "../../display.js";
import {
    addPoint
} from "../challenge.js";
import {
    Ball
} from "../../components/ball.js";
import {
    Triangle
} from "../../components/triangle.js";

let goDefaultNextStep = false;
let firstRun = true;
let endEnonce = false;

let triangle;

let found = false;
let once = true;

let startTime = 0;
let foundTime = 0;
let timeToWait = 2000; // in ms
let solutionTime = 20000; // in ms
let goEndTime = false;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

let showSolution = false;

export function c1TracerIsoceleShow(sketch, f, balls, round) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)


    
    let b1 = createVector(-(width/2 - width), -(height/2 - height))
    sketch.circle(b1.x, b1.y, 90)

    if (!endEnonce && audioMedia.checkIfAudioEnded()) {
        endEnonce = true;
    }

    if(!showSolution && endEnonce == true && millis() - startTime > solutionTime) {
        showSolution = true;
        audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/39_voici_la_solution.wav")
    }
    if(showSolution) {    
        let b2 = new Ball(width/2 - 150, height/3)
        let b3 = new Ball(width/2 + 150, height/3)
        triangle = new Triangle(b1, b2, b3)
        sketch.noFill()
        sketch.stroke(255)
        sketch.strokeWeight(5)
        sketch.circle(b2.x, b2.y, 90)
        sketch.circle(b3.x, b3.y, 90)
        triangle.show(sketch)
        triangle.showAngle(sketch, f, true)
    }


    if (!showSolution && balls.ball_nb >= 2) {
        let b2 = createVector(-(balls.balls[1].x - width), -(balls.balls[1].y - height))
        let b3 = createVector(-(balls.balls[0].x - width), -(balls.balls[0].y - height))
        sketch.fill(255)
        sketch.noStroke()
        triangle = new Triangle(b1, b2, b3)
        
        triangle.show(sketch)
        triangle.showAngle(sketch, f, true)
        
        if (triangle.IsIsoceleTriangle()) {
            found = true;
        }
    }

    if (found == true && endEnonce == true && once == true) {
        foundTime = millis()
        once = false;
        // audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/correct_sound.wav")
        addPoint(1)
    }
    if ((found||showSolution) && audioMedia.checkIfAudioEnded()) {
        goEndTime = true
    }
    if (goEndTime) {
        if (millis() - foundTime > timeToWait) {
            goDefaultNextStep = true
        }
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "c2TracerHauteurB"
    }
    return "c1TracerIsocele"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/29_defi_trace_isocele.wav")
    startTime = millis()
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    endEnonce = false;
    found = false;
    once = true;
    goEndTime = false;
    showSolution = false;
    audioMedia.stopSound()
}

function showAudioButtons(sketch) {
    pause = navBar.checkPauseButtons()
    repeat = navBar.checkRepeatButtons()
    navBar.showPlayPauseButton(sketch, pause)
    navBar.showRepeatButton(sketch, repeat)
    if (pause == true && pauseTrigger == false) {
        audioMedia.pauseSound()
        pauseTrigger = true;
    }
    if (pause == false && pauseTrigger == true) {
        audioMedia.resumeSound()
        pauseTrigger = false;
    }
    if (repeat == true && repeatTrigger == false) {
        audioMedia.restartSound()
        repeatTrigger = true;
    }
    if (repeat == false) {
        repeatTrigger = false;
    }
}