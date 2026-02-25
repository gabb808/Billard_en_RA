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

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

let startTime = 0;
let firstAudio = true;
let solutionTrigger = false;
let solutionFound = false;
let once = false;

let triangle

export function hauteurPracticeBShow(sketch, f, balls) {
    if (firstRun) {
        onEnter(balls)
    }
    showAudioButtons(sketch)

    //DRAWING SETUP
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Hauteur", width/2, 150);

    if (solutionTrigger == true || solutionFound == true) {
        triangle.showAllAltitudeB(sketch)
        if(audioMedia.checkIfAudioEnded()) {
            goDefaultNextStep = true;
        }
    }

    if (firstAudio && audioMedia.checkIfAudioEnded() && solutionFound == false) {
        firstAudio = false;
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/13_hauteurs_consigne_B.wav")
    }

    triangle.show(sketch)
    triangle.showLetter(sketch, f)

    
    if (!solutionFound && !solutionTrigger) {
        showAttempLine(sketch, balls)
        solutionFound = triangle.placeAltitudeB(balls)
    }

    if (solutionFound == true && !once) {
        once = true;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/7_Bravo_tu_as_trouve.wav")
    }

    if ((solutionTrigger == false) && (millis() - startTime > 25000) && (solutionFound == false)) {
        solutionTrigger = true;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/14_solution_hauteur_de_B.wav")
    }

    if (goDefaultNextStep == true) {
        sleep(1000)
        onExit()
        return "hauteurPracticeC"
    }
    return "hauteurPracticeB"
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function onEnter(balls) {
    let b1 = new Ball(width / 3 + 80, 3 * height / 4 + 70)
    let b2 = new Ball(2 * width / 3 + 74, 3.2 * height / 4)
    let b3 = new Ball(width / 2 - 80, 74 + height / 4)
    triangle = new Triangle(b1, b2, b3)
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/12_A_toi_de_jouer_avec_2_palets.wav")
    startTime = millis()
}

function onExit() {
    startTime = 0;
    solutionTrigger = false;
    solutionFound = false;
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function hauteurPracticeBReset() {
    onExit()
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

function showAttempLine(sketch, balls) {
    if (balls.ball_nb >= 2) {
        sketch.push()
        sketch.translate(width, height)
        sketch.rotate(sketch.PI);
        sketch.stroke(255, 0, 0);
        sketch.strokeWeight(5);
        sketch.line(balls.balls[0].x, balls.balls[0].y, balls.balls[1].x, balls.balls[1].y)
        sketch.pop()
    }
}