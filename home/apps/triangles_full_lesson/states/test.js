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

export function testShow(sketch, f, balls) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    //WRITE YOUR CODE HERE
    //TO PLAY WITH TRIANGLES AND SHOW ALL THE SYMBOLS
    if(balls.ball_nb >= 2) {
        let b1 = new Ball(balls.balls[0].x, balls.balls[0].y)
        let b2 = new Ball(balls.balls[1].x, balls.balls[1].y)
        let b3 = new Ball(balls.balls[2].x, balls.balls[2].y)
        console.log(b1, b2, b3)
        triangle = new Triangle(b1, b2, b3)
        sketch.push()
        sketch.translate(width, height)
        sketch.rotate(sketch.PI);
        triangle.show(sketch)
        triangle.showLetter(sketch, f)
        triangle.showAngle(sketch, f)
        // triangle.showAltitudes(sketch)
        // triangle.showDottedLines(sketch)
        // triangle.showRightSymbolsAltitudes(sketch)
        // triangle.showAllMediatriceAB(sketch)
        // triangle.showAllMediatriceBC(sketch)
        // triangle.showAllMediatriceAC(sketch)
        sketch.pop()
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "test"
    }
    return "test"
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

export function testReset() {
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