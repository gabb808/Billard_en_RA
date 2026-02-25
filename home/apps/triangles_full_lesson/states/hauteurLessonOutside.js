import {
    audioMedia,
    navBar
} from "../display.js"
import {
    Triangle
} from "../components/triangle.js"
import {
    Ball
} from "../components/ball.js"

let goDefaultNextStep = false;
let firstRun = true;

let triangle;

let prolongerACtime = 14;
let tracerHauteurBtime = 17.5;
let showRightSymbolHauteurBtime = 19;
let showAllHauteurCtime = 22.5;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function hauteurLessonOutsideShow(sketch, f, balls) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Hauteur", width/2, 150);

    triangle.show(sketch)
    triangle.showLetter(sketch, f)

    if (audioMedia.getAudioTime() > prolongerACtime) {
        triangle.showDottedLineB(sketch)
    }
    if (audioMedia.getAudioTime() > tracerHauteurBtime) {
        triangle.showAltitudeB(sketch)
    }
    if (audioMedia.getAudioTime() > showRightSymbolHauteurBtime) {
        triangle.showRightSymbolsAltitudeB(sketch)
    }
    if (audioMedia.getAudioTime() > showAllHauteurCtime) {
        triangle.showAllAltitudeC(sketch)
    }

    // triangle.showAltitudes(sketch)
    // triangle.showDottedLines(sketch)
    // triangle.showRightSymbolsAltitudes(sketch)

    // //TO PLAY WITH TRIANGLES AND SHOW ALL THE SYMBOLS
    // if(balls.ball_nb >= 2) {
    //     let b1 = new Ball(balls.balls[0].x, balls.balls[0].y)
    //     let b2 = new Ball(balls.balls[1].x, balls.balls[1].y)
    //     let b3 = new Ball(balls.balls[2].x, balls.balls[2].y)
    //     triangle = new Triangle(b1, b2, b3)
    //     sketch.push()
    //     sketch.translate(width, height)
    //     sketch.rotate(sketch.PI);
    //     triangle.show(sketch)
    //     triangle.showLetter(sketch, f)
    //     triangle.showAltitudes(sketch)
    //     triangle.showDottedLines(sketch)
    //     triangle.showRightSymbolsAltitudes(sketch)
    //     // triangle.showAllMediatriceAB(sketch)
    //     // triangle.showAllMediatriceBC(sketch)
    //     // triangle.showAllMediatriceAC(sketch)
    //     sketch.pop()
    // }

    if (goDefaultNextStep == true) {
        sleep(2000)
        onExit()
        return "hauteurPracticeB"
    }
    return "hauteurLessonOutside"
}

function onEnter() {
    firstRun = false;
    // Optus triangle
    let b1 = new Ball(831, 666)
    let b2 = new Ball(1273, 539)
    let b3 = new Ball(566, 470)
    triangle = new Triangle(b1, b2, b3)
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/11_bis_hauteurs_outside.wav")
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function hauteurLessonOutsideReset() {
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
    if (repeat == false ) {
        repeatTrigger = false;
    }
}