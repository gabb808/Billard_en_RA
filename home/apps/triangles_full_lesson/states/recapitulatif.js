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
let triangleHauteur;
let triangleIsocele;

let showMediatricesTime = 3;
let showHauteurTime = 11.5;
let showIsoceleTime = 19;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function recapitulatifShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Récapitulatif", width / 2, 150);

    if (audioMedia.getAudioTime() > showMediatricesTime) {
        sketch.push()
        sketch.translate(-90, 300)
        sketch.scale(0.55)
        triangleMediatrice.show(sketch, f)
        triangleMediatrice.showAllMediatrice(sketch)
        sketch.pop()
    }
    if (audioMedia.getAudioTime() > showHauteurTime) {
        sketch.push()
        sketch.translate(500, 300)
        sketch.scale(0.52)
        triangleHauteur.show(sketch)
        triangleHauteur.showAllAltitudes(sketch)
        sketch.pop()
    }
    if (audioMedia.getAudioTime() > showIsoceleTime) {
        sketch.push()
        sketch.translate(width + 160, height - 100)
        sketch.rotate(PI)
        sketch.scale(0.8)
        triangleIsocele.show(sketch)
        triangleIsocele.showAllAltitudeA(sketch)
        triangleIsocele.showAllMediatriceBC(sketch)
        sketch.pop()
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "challengeIntroduction"
    }
    return "recapitulatif"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/24_bis_recapitulatif.wav")
    let b1 = new Ball(961, 790)
    let b2 = new Ball(1162, 462)
    let b3 = new Ball(528, 233)
    triangleMediatrice = new Triangle(b1, b2, b3)

    b1 = new Ball(831, 666)
    b2 = new Ball(1273, 539)
    b3 = new Ball(566, 470)
    triangleHauteur = new Triangle(b1, b2, b3)

    b1 = new Ball(613, 646)
    b2 = new Ball(842, 311)
    b3 = new Ball(587, 240)
    triangleIsocele = new Triangle(b1, b2, b3)
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function recapitulatifReset() {
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