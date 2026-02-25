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

let found = false;
let once = true;

let triangle;

let startTime = 0;
let foundTime = 0;
let timeToWait = 2000; // in ms
let solutionTime = 20000; // in ms
let goEndTime = false;
let showSolution = false;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function c5TracerEquilateralShow(sketch, f, balls, round) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    if (!endEnonce && audioMedia.checkIfAudioEnded()) {
        endEnonce = true;
    }

    let b1 = createVector(-(width / 2 - width), -(height / 2 - height))
    sketch.circle(b1.x, b1.y, 90)

    if(!showSolution && endEnonce == true && millis() - startTime > solutionTime) {
        showSolution = true;
        audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/39_voici_la_solution.wav")
    }
    if(showSolution) {    
        let b2 = new Ball(width/2 - 150, height/2 + 258)
        let b3 = new Ball(width/2 + 150, height/2 + 258)
        triangle = new Triangle(b1, b2, b3)
        sketch.noFill()
        sketch.stroke(255)
        sketch.strokeWeight(5)
        sketch.circle(b2.x, b2.y, 90)
        sketch.circle(b3.x, b3.y, 90)
        triangle.show(sketch)
        triangle.showAngle(sketch, f, true)
    }

    if (endEnonce) {
        if (!showSolution && balls.ball_nb >= 2) {
            let b2 = createVector(-(balls.balls[1].x - width), -(balls.balls[1].y - height))
            let b3 = createVector(-(balls.balls[0].x - width), -(balls.balls[0].y - height))
            sketch.fill(255)
            sketch.noStroke()
            triangle = new Triangle(b1, b2, b3)

            triangle.show(sketch)
            triangle.showAngle(sketch, f, true)

            if (triangle.IsEquilateralTriangle()) {
                found = true;
            }
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
        return "c6TracerMediatriceSegmentAB"
    }
    return "c5TracerEquilateral"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/33_defi_trace_equilateral.wav")
    startTime = millis()
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
    endEnonce = false;
    found = false;
    once = true;
    showSolution = false;
    goEndTime = false;
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