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

let triangleEquilateral;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function mediatriceHauteurEquilateralShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    sketch.stroke(255);
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Triangle équilatéral", width / 2, 150);

    sketch.push()
    sketch.translate(-100, 0)
    triangleEquilateral.show(sketch)
    triangleEquilateral.showAllMediatrice(sketch)
    triangleEquilateral.showAllAltitudes(sketch)
    sketch.pop()

    if (goDefaultNextStep == true) {
        sleep(2500)
        onExit()
        return "recapitulatif"
    }
    return "mediatriceHauteurEquilateral"
}

function onEnter() {
    firstRun = false;
    //Equilateral triangle
    let b4 = new Ball(944, 674)
    let b5 = new Ball(1229, 519)
    let b6 = new Ball(953, 352)
    triangleEquilateral = new Triangle(b4, b5, b6)

    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/24_remarque_3_triangle_equilateral.wav")
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function mediatriceHauteurEquilateralReset() {
    onExit()
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
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