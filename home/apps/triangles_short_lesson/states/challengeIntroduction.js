import {
    audioMedia,
    navBar
} from "../display.js"
import {
    Ball
} from "../components/ball.js"
import {
    Triangle
} from "../components/triangle.js"

let goDefaultNextStep = false;
let firstRun = true;

let triangleMediatrice;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function challengeIntroductionShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("A toi de jouer!", width / 2, 550);

    if (goDefaultNextStep == true) {
        onExit()
        return "countdown"
    }
    return "challengeIntroduction"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_short_lesson/assets/challengeIntroductionShortLesson.wav")
    let b1 = new Ball(761, 790)
    let b2 = new Ball(962, 462)
    let b3 = new Ball(328, 233)
    triangleMediatrice = new Triangle(b1, b2, b3)
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function challengeIntroductionReset() {
    onExit()
}

function showAudioButtons(sketch) {
    pause = navBar.checkPauseButtons()
    repeat = navBar.checkRepeatButtons()
    navBar.showPlayPauseButton(sketch, pause)
    navBar.showRepeatButton(sketch, repeat)
    if (audioMedia.checkIfAudioEnded()) {
        goDefaultNextStep = true;
    }
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