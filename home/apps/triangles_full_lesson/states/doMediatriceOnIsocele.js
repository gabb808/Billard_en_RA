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

let triangleIsocele;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

let startTime = 0;
let solutionFound = false;
let solutionTrigger = false;
let remarqueTrigger = false;
let once=true;

export function doMediatriceOnIsoceleShow(sketch, f, balls) {
    if (firstRun) {
        onEnter(balls)
    }
    showAudioButtons(sketch)
    
    //DRAWING SETUP
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Triangle Isocèle", width/2, 150);

    triangleIsocele.show(sketch)
    triangleIsocele.showLetter(sketch, f)
    triangleIsocele.showIsoceleEqualSymbols(sketch)
    
    if(!solutionTrigger && !solutionFound) {
        showAttempLine(sketch, balls)
        solutionFound = triangleIsocele.placeMediatriceAB(balls)
        if(solutionFound) {
            audioMedia.stopSound();
            audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/7_Bravo_tu_as_trouve.wav")
        }
    }
    if (solutionFound == true || solutionTrigger == true) {
        triangleIsocele.showAllMediatriceAB(sketch)
    }

    if ((solutionTrigger == false) && (solutionFound == false) && (millis() - startTime > 20000)) {
        solutionTrigger = true;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/6_solution_mediatrice_de_AB.wav")
    }
    if((!remarqueTrigger) && (solutionTrigger == true) && (audioMedia.checkIfAudioEnded())) {
        remarqueTrigger = true;
    }
    if((!remarqueTrigger) && (solutionFound == true) && (audioMedia.checkIfAudioEnded())) {
        remarqueTrigger = true;
    }
    
    if(remarqueTrigger && once) {
        once = false;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/22_remarque_1.wav")
    }
    if(remarqueTrigger && audioMedia.checkIfAudioEnded()) {
        goDefaultNextStep = true;
    }
    
    if (goDefaultNextStep == true) {
        sleep(2000)
        onExit()
        return "doHauteurOnIsocele"
    }
    return "doMediatriceOnIsocele"
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function onEnter(balls) {
    firstRun = false;
    let b1 = new Ball(1147, 774)
    let b3 = new Ball(747, 724)
    let b2 = new Ball(1083, 502)
    triangleIsocele = new Triangle(b1, b2, b3)
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/21_consignes_mediatrice_AB.wav")
    startTime = millis()
}

function onExit() {
    startTime = 0;
    solutionTrigger = false;
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function doMediatriceOnIsoceleReset() {
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
    if (repeat == false ) {
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