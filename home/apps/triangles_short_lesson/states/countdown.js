import {
    audioMedia,
    navBar
} from "../display.js"

let goDefaultNextStep = false;
let firstRun = true;

let show3Time = 0.2;
let show2Time = 1.2;
let show1Time = 2.2;
let showGoTime = 3.2;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function countdownShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)
    
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 250);
    sketch.textAlign(sketch.CENTER)

    let audioTime = audioMedia.getAudioTime()
    if (audioTime > show3Time && audioTime < show2Time) {
        sketch.text("3", width / 2, height / 2 + 100);
    }
    if (audioTime > show2Time && audioTime < show1Time) {
        sketch.text("2", width / 2, height / 2  + 100);
    }
    if (audioTime > show1Time && audioTime < showGoTime) {
        sketch.text("1", width / 2, height / 2  + 100);
    }
    if (audioTime > showGoTime) {
        sketch.text("GO !", width / 2, height / 2 + 100);
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "challenge"
    }
    return "countdown"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/28_start_sound_effect.wav")
    audioMedia.setAudioVolume(0.4)
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function countdownReset() {
    onExit()
}

function showAudioButtons(sketch) {
    // pause = navBar.checkPauseButtons()
    // repeat = navBar.checkRepeatButtons()
    // navBar.showPlayPauseButton(sketch, pause)
    // navBar.showRepeatButton(sketch, repeat)
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
    if (repeat == false ) {
        repeatTrigger = false;
    }
}