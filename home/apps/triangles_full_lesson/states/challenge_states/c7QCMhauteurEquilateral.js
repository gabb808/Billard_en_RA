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
let once1 = true;
let once2 = true;
let showSolution = false;

let startTime = 0;
let foundTime = 0;
let timeToWait = 2000; // in ms
let solutionTime = 20000; // in ms
let goEndTime = false;

let triangle1;
let triangle2;
let triangle3;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function c7QCMhauteurEquilateralShow(sketch, f, balls, round) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    triangle1.show(sketch)
    triangle2.show(sketch)
    triangle3.show(sketch)
    triangle1.showAllAltitudeA(sketch)
    triangle2.showAllAltitudeA(sketch)
    triangle3.showAllAltitudeA(sketch)
    triangle1.showAllAltitudeB(sketch)
    triangle2.showAllAltitudeB(sketch)
    triangle3.showAllAltitudeB(sketch)

    if (!showSolution && endEnonce == true && millis() - startTime > solutionTime) {
        showSolution = true;
        audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/39_voici_la_solution.wav")
    }
    if (showSolution) {
        sketch.noFill()
        sketch.stroke(255, 0, 255)
        sketch.strokeWeight(5)
        sketch.circle(triangle2.x, triangle2.y, 280)
    }

    if (endEnonce && (!found || !showSolution) && balls.ball_nb >= 1) {
        let ball0 = createVector(-(balls.balls[0].x - width), -(balls.balls[0].y - height))
        let ball1 = createVector(-(balls.balls[1].x - width), -(balls.balls[1].y - height))
        if (triangle2.PointInTriangle(ball0) || triangle2.PointInTriangle(ball1)) {
            found = true;
        }
        if (once1 && triangle1.PointInTriangle(ball0) || triangle1.PointInTriangle(ball1)) {
            once1 = false;

            audioMedia.stopSound()
            audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/wrong_answer_sound.wav")
        }
        if (once2 && triangle3.PointInTriangle(ball0) || triangle3.PointInTriangle(ball1)) {
            once2 = false;

            audioMedia.stopSound()
            audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/wrong_answer_sound.wav")
        }
    }

    if (!endEnonce && audioMedia.checkIfAudioEnded()) {
        endEnonce = true;
    }

    if (found == true && endEnonce == true && once == true) {
        foundTime = millis()
        once = false;
        // audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/correct_sound.wav")
        addPoint(1)
    }
    if ((found || showSolution) && audioMedia.checkIfAudioEnded()) {
        goEndTime = true
    }
    if (goEndTime) {
        if (millis() - foundTime > timeToWait) {
            goDefaultNextStep = true
        }
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "c8TracerHauteursTriangle"
    }
    return "c7QCMhauteurEquilateral"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/35_defi_consigne_QCM_hauteur_equilateral.wav")

    let b1 = new Ball(1313, 662)
    let b2 = new Ball(1650, 790)
    let b3 = new Ball(1548, 513)
    triangle1 = new Triangle(b1, b2, b3)

    let b4 = new Ball(1138, 743)
    let b5 = new Ball(804, 718)
    let b6 = new Ball(992, 443)
    triangle2 = new Triangle(b4, b5, b6)

    let b7 = new Ball(300, 700)
    let b8 = new Ball(600, 700)
    let b9 = new Ball(450, 500)
    triangle3 = new Triangle(b7, b8, b9)

    startTime = millis()
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
    endEnonce = false;
    found = false;
    once = true;
    once1 = true;
    once2 = true;
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