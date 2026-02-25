import {
    audioMedia
} from "../display.js";
import {
    c1TracerIsoceleShow,
} from "./challenge_states/c1TracerIsocele.js";
import {
    c2TracerHauteurBShow,
} from "./challenge_states/c2TracerHauteurB.js";
import {
    c3QCMmediatriceIsoceleShow,
} from "./challenge_states/c3QCMmediatriceIsocele.js";
import {
    c4TracerMediatricesTriangleShow,
} from "./challenge_states/c4TracerMediatricesTriangle.js";
import {
    c5TracerEquilateralShow,
} from "./challenge_states/c5TracerEquilateral.js";
import {
    c6TracerMediatriceSegmentABShow,
} from "./challenge_states/c6TracerMediatriceSegmentAB.js";
import {
    c7QCMhauteurEquilateralShow
} from "./challenge_states/c7QCMhauteurEquilateral.js";
import {
    c8TracerHauteursTriangleShow
} from "./challenge_states/c8TracerHauteursTriangle.js";

let goDefaultNextStep = false;
let firstRun = true;

let numberOfPoint = 0;

let timeLeft = 120; // 120 seconds
let lastSecond = 0;

// let challengeState = "c8TracerHauteursTriangle";
// let challengeState = "c7QCMhauteurEquilateral";
// let challengeState = "c6TracerMediatriceSegmentAB";
// let challengeState = "c5TracerEquilateral";
// let challengeState = "c4TracerMediatricesTriangle";
// let challengeState = "c3QCMmediatriceIsocele";
// let challengeState = "c2TracerHauteurB";
let challengeState = "c1TracerIsocele";

let round = true; //Default
// let round = false;

export function challengeShow(sketch, f, balls) {
    if (firstRun) {
        onEnter()
    }
    sketch.push()
    sketch.translate(-300, 0)
    showTimerIcon(sketch, f)
    sketch.pop()
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.fill(255);
    sketch.text(`Score : ${numberOfPoint}`, width / 2 + 300, 177)
    showPointIncrementation(sketch, f)

    // challenge state machine
    switch (challengeState) {
        case "c1TracerIsocele":
            challengeState = c1TracerIsoceleShow(sketch, f, balls, round);
            break;
        case "c2TracerHauteurB":
            challengeState = c2TracerHauteurBShow(sketch, f, balls, round);
            break;
        case "c3QCMmediatriceIsocele":
            challengeState = c3QCMmediatriceIsoceleShow(sketch, f, balls, round);
            break;
        case "c4TracerMediatricesTriangle":
            challengeState = c4TracerMediatricesTriangleShow(sketch, f, balls, round);
            break;
        case "c5TracerEquilateral":
            challengeState = c5TracerEquilateralShow(sketch, f, balls, round);
            break;
        case "c6TracerMediatriceSegmentAB":
            challengeState = c6TracerMediatriceSegmentABShow(sketch, f, balls, round);
            break;
        case "c7QCMhauteurEquilateral":
            challengeState = c7QCMhauteurEquilateralShow(sketch, f, balls, round);
            break;
        case "c8TracerHauteursTriangle":
            challengeState = c8TracerHauteursTriangleShow(sketch, f, balls, round);
            if(challengeState == "c1TracerIsocele"){
                round = !round;
            }
            break;
        default:
            break;
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "challengeResult"
    }
    return "challenge"
}

function onEnter() {
    firstRun = false;
    numberOfPoint = 0;
    lastSecond = millis();
    // audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/8_Tres_bien_maintenant.wav")
}

function onExit() {
    timeLeft = 120;
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function challengeReset() {
    onExit()
}

export function getNumberOfPoint() {
    return numberOfPoint;
}

export function addPoint(toAdd) {
    numberOfPoint += toAdd;
    pointIncrementation = toAdd;
    yPointIncrementation = 27;
    intensityPointIncrementation = 255;
}

function showTimerIcon(sketch, f) {
    sketch.push()
    sketch.translate(width / 2 - 180, 150)
    sketch.strokeWeight(5)
    sketch.stroke(255, 255, 0)
    sketch.line(0, 0, 0, -40)
    sketch.strokeWeight(12)
    sketch.line(-15, -55, 15, -55)
    sketch.strokeWeight(5)
    sketch.circle(40, -40, 10)
    sketch.stroke(255)
    sketch.noFill()
    sketch.circle(0, 0, 100)
    sketch.pop()
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    if (timeLeft < 10) {
        sketch.text(`0:0${timeLeft} s`, width / 2, 177);
    } else {
        sketch.text(`0:${timeLeft} s`, width / 2, 177);
    }

    if (millis() - lastSecond >= 1000) {
        timeLeft -= 1;
        lastSecond = millis();
    }

    if (timeLeft < 0) {
        goDefaultNextStep = true;
    }
}

let pointIncrementation = 0;
let yPointIncrementation = 0; //27;
let intensityPointIncrementation = 0; //255;

function showPointIncrementation(sketch, f) {
    if (intensityPointIncrementation > 0) {
        sketch.textFont(f, 50);
        sketch.fill(intensityPointIncrementation)
        if (pointIncrementation >= 0) {
            sketch.text(`+ ${pointIncrementation}`, width / 2 + 300, 250 - yPointIncrementation)
        }
        if (pointIncrementation < 0) {
            sketch.text(`- ${abs(pointIncrementation)}`, width / 2 + 300, 250)
        }
        if (yPointIncrementation > 0) {
            yPointIncrementation -= 1;
        }
        intensityPointIncrementation -= 2;
    }

}