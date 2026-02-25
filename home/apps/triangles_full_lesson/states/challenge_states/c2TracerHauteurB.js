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

let showSolution = false;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function c2TracerHauteurBShow(sketch, f, balls, round) {
    if (firstRun) {
        onEnter(round)
    }
    showAudioButtons(sketch)

    if (!endEnonce && audioMedia.checkIfAudioEnded()) {
        endEnonce = true;
    }

    if(!showSolution && endEnonce == true && millis() - startTime > solutionTime) {
        showSolution = true;
        audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/39_voici_la_solution.wav")
    }

    if(balls.ball_nb >= 2) {
        sketch.push()
        sketch.translate(width, height)
        sketch.rotate(sketch.PI);
        sketch.stroke(255, 0, 0);
        sketch.strokeWeight(5);
        sketch.line(balls.balls[0].x, balls.balls[0].y, balls.balls[1].x, balls.balls[1].y)
        sketch.pop()
    }

    triangle.show(sketch)
    triangle.showLetter(sketch, f)
    
    if (endEnonce && (found || showSolution)) {
        triangle.showAllAltitudeB(sketch)
    } else {
        found = triangle.placeAltitudeB(balls)
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
        return "c3QCMmediatriceIsocele"
    }
    return "c2TracerHauteurB"
}

function onEnter(round) {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/30_defi_consigne_hauteur_B.wav")
    startTime = millis()
    let b2 = new Ball(961, 890)
    let b1 = new Ball(1162, 462)
    let b3 = new Ball(528, 333)
    if(!round) {
        b1 = new Ball(1102, 740)
        b2 = new Ball(1400, 510)
        b3 = new Ball(740, 600)
    }
    triangle = new Triangle(b1, b2, b3)
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    endEnonce = false;
    found = false;
    once = true;
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

function showAttempLine(sketch, balls) {
    if (balls.ball_nb >= 2) {
        sketch.push()
        sketch.translate(width, height)
        sketch.rotate(sketch.PI);
        sketch.stroke(255, 0, 0);
        sketch.strokeWeight(5);
        sketch.line(balls.balls[0].x, balls.balls[0].y, balls.balls[1].x, balls.balls[1].y)
        sketch.pop()
    }
}