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

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function mediatriceLessonTriangleShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    //DRAWING SETUP
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Médiatrice", width/2, 150);

    draw_triangle_with_mediatrice(sketch, f)

    if (goDefaultNextStep == true) {
        onExit()
        return "challengeIntroduction"
    }
    return "mediatriceLessonTriangle"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/2_mediatrices_triangle_def.wav")
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function mediatriceLessonTriangleReset() {
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

function draw_triangle_with_mediatrice(sketch, f) {
    let b1 = new Ball(width / 3 - 80, 3 * height / 4 + 70)
    let b2 = new Ball(2 * width / 3 - 40, 3 * height / 4)
    let b3 = new Ball(width / 2 + 80, height / 4)
    let t = new Triangle(b1, b2, b3)
    t.show(sketch, f)
    t.showPerpendicularBisector(sketch, f)
    t.showEqualSymbols(sketch)
    t.showRightSymbols(sketch)
    // t.showCircumCircle(sketch, f)
}