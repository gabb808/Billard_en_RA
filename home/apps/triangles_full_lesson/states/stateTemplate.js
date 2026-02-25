import {
    audioMedia,
    navBar
} from "../display.js"

let goDefaultNextStep = false;
let firstRun = true;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function __state__Show(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    //WRITE YOUR CODE HERE

    if (goDefaultNextStep == true) {
        onExit()
        return "__nextState__"
    }
    return "__state__"
}

function onEnter() {
    firstRun = false;
    // audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/0_intro.wav")
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function stateTemplateReset() {
    onExit()
}

function showAudioButtons(sketch) {
    pause = navBar.checkPauseButtons()
    repeat = navBar.checkRepeatButtons()
    navBar.showPlayPauseButton(sketch, pause)
    navBar.showRepeatButton(sketch, repeat)
    // if (audioMedia.checkIfAudioEnded()) {
    //     goDefaultNextStep = true;
    // }
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
    if (repeat == false ) {
        repeatTrigger = false;
    }
}