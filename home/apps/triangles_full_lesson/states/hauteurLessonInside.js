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

let firstAudio = true;
let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function hauteurLessonInsideShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    triangle.show(sketch)
    triangle.showLetter(sketch, f)
    triangle.showAllAltitudeA(sketch)
    if(!firstAudio) {
        triangle.showAllAltitudeB(sketch)
        triangle.showAllAltitudeC(sketch)
    }

    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Hauteur", width/2 + 100, 150);

    // console.log(triangle.triangle[0].x)
    sketch.fill(0, 255, 0)
    sketch.textFont(f, 60);
    sketch.text("(D)", triangle.triangle[0].x + 40, triangle.triangle[0].y - 100)

    if(firstAudio == true && audioMedia.checkIfAudioEnded() == true) {
        firstAudio = false;
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/11_hauteurs_def_suite.wav")
    }
    //     triangle.showAltitudes(sketch)
    //     triangle.showDottedLines(sketch)
    //     triangle.showRightSymbolsAltitudes(sketch)

    if (goDefaultNextStep == true) {
        onExit()
        return "hauteurLessonOutside"
    }
    return "hauteurLessonInside"
    //TO PLAY WITH TRIANGLES AND SHOW ALL THE SYMBOLS
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
    //     triangle.showAllMediatriceAB(sketch)
    //     triangle.showAllMediatriceBC(sketch)
    //     triangle.showAllMediatriceAC(sketch)
    //     sketch.pop()
    // }
}

function onEnter() {
    firstRun = false;
    // Optus triangle
    // let b1 = new Ball(507, 659)
    // let b2 = new Ball(447, 297)
    // let b3 = new Ball(398, 391)

    // Normal triangle
    let b1 = new Ball(width / 2 - 80, 1 * height / 4 + 70)
    let b2 = new Ball(2 * width / 3 + 74, 3.1 * height / 4)
    let b3 = new Ball(width / 3 + 80, width / 2 - 80, 3.1* height / 4)
    triangle = new Triangle(b1, b2, b3)
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/10_hauteurs_def.wav")
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
    if (firstAudio == false && audioMedia.checkIfAudioEnded()) {
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

export function hauteurLessonInsideReset() {
    onExit()
}