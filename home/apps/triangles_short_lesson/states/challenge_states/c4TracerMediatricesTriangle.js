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

let showSolution = false;

let perpendicularABfound = false
let perpendicularBCfound = false
let perpendicularACfound = false

let numberOfmediatriceFound = 0;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function c4TracerMediatricesTriangleShow(sketch, f, balls, round) {
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
        perpendicularBCfound = true
        perpendicularACfound = true
        perpendicularABfound = true
    }

    //DRAWING SETUP
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textAlign(sketch.CENTER)

    sketch.textFont(f, 42);
    sketch.text(`Trouvées : ${numberOfmediatriceFound}/3`, width/2- 20, 280);

    triangle.show(sketch)
    triangle.showLetter(sketch, f)

    if (perpendicularABfound) {
        triangle.showAllMediatriceAB(sketch)
    } else {
        perpendicularABfound = triangle.placeMediatriceAB(balls)
        if (perpendicularABfound) {
            numberOfmediatriceFound++
            addPoint(0.5)
        }
    }
    if (perpendicularBCfound) {
        triangle.showAllMediatriceBC(sketch)
    } else {
        perpendicularBCfound = triangle.placeMediatriceBC(balls)
        if (perpendicularBCfound) {
            numberOfmediatriceFound++
            addPoint(0.5)
        }
    }
    if (perpendicularACfound) {
        triangle.showAllMediatriceAC(sketch)
    } else {
        perpendicularACfound = triangle.placeMediatriceAC(balls)
        if (perpendicularACfound) {
            numberOfmediatriceFound++
            addPoint(0.5)
        }
    }
    if (!perpendicularABfound || !perpendicularBCfound || !perpendicularACfound) {
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
        return "c6TracerMediatriceSegmentAB"
    }
    return "c4TracerMediatricesTriangle"
}

function onEnter(round) {
    firstRun = false;
    let b1 = new Ball(874, 858)
    let b2 = new Ball(764, 377)
    let b3 = new Ball(966, 523)
    if(!round) {
        b3 = new Ball(1050, 540)
    }
    triangle = new Triangle(b1, b2, b3)
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/32_defi_trois_mediatrices.wav")
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
    perpendicularABfound = false
    perpendicularBCfound = false
    perpendicularACfound = false
    numberOfmediatriceFound = 0;
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