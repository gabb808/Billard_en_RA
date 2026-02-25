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
let goEndTime = false;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function __challengeState__Show(sketch, f, balls, round) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    if (!endEnonce && audioMedia.checkIfAudioEnded()) {
        endEnonce = true;
    }

    

    if (found == true && endEnonce == true && once == true) {
        foundTime = millis()
        once = false;
        // audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/correct_sound.wav")
        addPoint(1)
    }
    if (found && audioMedia.checkIfAudioEnded()) {
        goEndTime = true
    }
    if (goEndTime) {
        if (millis() - foundTime > timeToWait) {
            goDefaultNextStep = true
        }
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "__defaultNextChallengeState__"
    }
    return "__challengeState__"
}

function onEnter() {
    firstRun = false;
    // audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/31_defi_consigne_QCM_mediatrice_isocele.wav")
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