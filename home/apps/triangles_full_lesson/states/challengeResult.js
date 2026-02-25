import {
    audioMedia,
    navBar
} from "../display.js"
import {
    getNumberOfPoint
} from "./challenge.js"

let goDefaultNextStep = false;
let firstRun = true;
let firstAudio = true;

let numberOfPoint = 0;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function challengeResultShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    if(firstAudio && audioMedia.checkIfAudioEnded()){
        firstAudio = false;
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/37_defi_fini.wav")
    }
    if(!firstAudio && audioMedia.checkIfAudioEnded()){
        goDefaultNextStep = true;
    }
    if(!firstAudio)
    {
        showAudioButtons(sketch)
    }
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 100);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Ton score du Défi :", width / 2, 350);
    sketch.textFont(f, 80);
    if(numberOfPoint >= 0.5) {
        sketch.text(`${numberOfPoint} points`, width / 2, 600);
        sketch.textFont(f, 100);
        sketch.text("Bravo!", width / 2, 850);
    }
    else {
        sketch.text(`${numberOfPoint} point`, width / 2, 600);
        sketch.textFont(f, 50);
        sketch.text("Ce n'est qu'un jeu, ça ne veut rien dire!", width / 2, 850);
    }

    if (goDefaultNextStep == true) {
        sleep(1000)
        onExit()
        return "outro"
    }
    return "challengeResult"
}

function onEnter() {
    firstRun = false;
    numberOfPoint = getNumberOfPoint();
    // console.log(numberOfPoint)
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/37_bis_finish_sound_effect.wav")
    audioMedia.setAudioVolume(0.2)
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function challengeResultReset() {
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