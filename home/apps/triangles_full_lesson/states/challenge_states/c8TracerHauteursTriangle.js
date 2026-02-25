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

let startTime = 0;
let foundTime = 0;
let timeToWait = 2000; // in ms
let solutionTime = 20000; // in ms
let goEndTime = false;

let altitudeCfound = false
let altitudeAfound = false
let altitudeBfound = false

let showSolution = false;

let numberOfAltitudeFound = 0;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function c8TracerHauteursTriangleShow(sketch, f, balls, round) {
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
    if(showSolution) {
        altitudeAfound = true
        altitudeBfound = true
        altitudeCfound = true
    }

    //DRAWING SETUP
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textAlign(sketch.CENTER)

    sketch.textFont(f, 42);
    sketch.text(`Trouvées : ${numberOfAltitudeFound}/3`, width/2- 20, 280);

    triangle.show(sketch)
    triangle.showLetter(sketch, f)

    if (altitudeCfound) {
        triangle.showAllAltitudeC(sketch)
    } else {
        altitudeCfound = triangle.placeAltitudeC(balls)
        if (altitudeCfound) {
            numberOfAltitudeFound++
            addPoint(0.5)
        }
    }
    if (altitudeAfound) {
        triangle.showAllAltitudeA(sketch)
    } else {
        altitudeAfound = triangle.placeAltitudeA(balls)
        if (altitudeAfound) {
            numberOfAltitudeFound++
            addPoint(0.5)
        }
    }
    if (altitudeBfound) {
        triangle.showAllAltitudeB(sketch)
    } else {
        altitudeBfound = triangle.placeAltitudeB(balls)
        if (altitudeBfound) {
            numberOfAltitudeFound++
            addPoint(0.5)
        }
    }
    if (!altitudeCfound || !altitudeAfound || !altitudeBfound) {
        showAttempLine(sketch, balls)
    }
    else{
        if(!showSolution) {
            found = true
        }
    }

    if (found == true && endEnonce == true && once == true) {
        foundTime = millis()
        once = false;
        // audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/correct_sound.wav")
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
        return "c1TracerIsocele"
    }
    return "c8TracerHauteursTriangle"
}

function onEnter(round) {
    firstRun = false;
    let b1 = new Ball(794, 858)
    let b2 = new Ball(764, 377)
    let b3 = new Ball(1166, 523)
    if(!round) {
        b1 = new Ball(600, 500)
        b2 = new Ball(785, 670)
        b3 = new Ball(1130, 550)
    }
    triangle = new Triangle(b1, b2, b3)
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/36_defi_trois_hauteurs.wav")
    startTime = millis()
}

function onExit() {
    firstRun = true;
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