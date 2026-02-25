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

let triangle1;
let triangle2;
let triangle3;

let startTime = 0;
let foundTime = 0;
let timeToWait = 2000; // in ms
let solutionTime = 20000; // in ms
let goEndTime = false;


let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function c3QCMmediatriceIsoceleShow(sketch, f, balls, round) {
    if (firstRun) {
        onEnter(round)
    }
    showAudioButtons(sketch)

    if (!endEnonce && audioMedia.checkIfAudioEnded()) {
        endEnonce = true;
    }

    if (!showSolution && endEnonce == true && millis() - startTime > solutionTime) {
        showSolution = true;
        audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/39_voici_la_solution.wav")
    }
    if (showSolution) {
        sketch.noFill()
        sketch.stroke(0, 255, 0)
        sketch.strokeWeight(5)
        if (round) {
            sketch.circle(triangle3.x, triangle3.y, 280)
        } else {
            sketch.circle(triangle2.x, triangle2.y, 280)
        }
    }

    if (endEnonce && (!found || !showSolution) && balls.ball_nb >= 1) {
        let ball0 = createVector(-(balls.balls[0].x - width), -(balls.balls[0].y - height))
        let ball1 = createVector(-(balls.balls[1].x - width), -(balls.balls[1].y - height))
        if (round) {
            if (triangle3.PointInTriangle(ball0) || triangle3.PointInTriangle(ball1)) {
                found = true;
            }
            if (once1 && triangle1.PointInTriangle(ball0) || triangle1.PointInTriangle(ball1)) {
                once1 = false;

                audioMedia.stopSound()
                audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/wrong_answer_sound.wav")
            }
            if (once2 && triangle2.PointInTriangle(ball0) || triangle2.PointInTriangle(ball1)) {
                once2 = false;
                audioMedia.stopSound()
                audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/wrong_answer_sound.wav")
            }
        } else {
            if (triangle2.PointInTriangle(ball0) || triangle2.PointInTriangle(ball1)) {
                found = true;
            }
            if (once1 && triangle1.PointInTriangle(ball0) || triangle1.PointInTriangle(ball1)) {
                once1 = false;
                audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/wrong_answer_sound.wav")
            }
            if (once2 && triangle3.PointInTriangle(ball0) || triangle3.PointInTriangle(ball1)) {
                once2 = false;
                audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/wrong_answer_sound.wav")
            }
        }
    }

    triangle1.show(sketch)
    triangle1.showAllMediatriceAB(sketch)

    triangle2.show(sketch)
    triangle2.showAllMediatriceAB(sketch)

    triangle3.show(sketch)
    triangle3.showAllMediatriceAB(sketch)

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
        return "c4TracerMediatricesTriangle"
    }
    return "c3QCMmediatriceIsocele"
}

function onEnter(round) {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/31_defi_consigne_QCM_mediatrice_isocele.wav")
    startTime = millis()
    let b1 = new Ball(1263, 662)
    let b2 = new Ball(1600, 790)
    let b3 = new Ball(1508, 633)
    if (!round) {
        b1 = new Ball(350, height / 2 + 100 + 100)
        b2 = new Ball(395, height / 2 - 204 + 100)
        b3 = new Ball(560, height / 2 + 91 + 100)
    }
    triangle1 = new Triangle(b1, b2, b3)

    let b4 = new Ball(width / 2 - 100, height / 2 + 100 + 100)
    let b5 = new Ball(width / 2 + 15, height / 2 - 204 + 100)
    let b6 = new Ball(width / 2 + 60, height / 2 + 91 + 100)
    if (!round) {
        b4 = new Ball(820, 700)
        b5 = new Ball(1080, 700)
        b6 = new Ball(950, 580)
    }
    triangle2 = new Triangle(b4, b5, b6)

    let b7 = new Ball(350, 700)
    let b8 = new Ball(650, 700)
    let b9 = new Ball(500, 590)
    if (!round) {
        b7 = new Ball(1263, 662)
        b8 = new Ball(1600, 790)
        b9 = new Ball(1508, 603)
    }
    triangle3 = new Triangle(b7, b8, b9)
}

function onExit() {
    firstRun = true;
    endEnonce = false;
    found = false;
    once = true;
    once1 = true;
    once2 = true;
    showSolution = false;
    goDefaultNextStep = false;
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