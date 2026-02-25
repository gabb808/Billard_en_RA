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
let firstAudio = true;
let solutionFound = false;
let solutionTrigger = false;
let remarqueTrigger = false;
let once=true;

export function doHauteurOnIsoceleShow(sketch, f, balls) {
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

    if(firstAudio && audioMedia.checkIfAudioEnded()) {
        firstAudio = false;
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/15_hauteurs_consigne_C.wav")
    }
    
    if(!solutionTrigger && !solutionFound) {
        showAttempLine(sketch, balls)
        solutionFound = triangleIsocele.placeAltitudeC(balls)
        if(solutionFound) {
            audioMedia.stopSound();
            audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/7_Bravo_tu_as_trouve.wav")
        }
    }
    if (solutionFound == true || solutionTrigger == true) {
        triangleIsocele.showAllAltitudeC(sketch)
    }

    if ((solutionTrigger == false) && (solutionFound == false) && (millis() - startTime > 20000)) {
        solutionTrigger = true;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/16_solution_hauteur_de_C.wav")
    }
    if((!remarqueTrigger) && (solutionTrigger == true) && (audioMedia.checkIfAudioEnded())) {
        remarqueTrigger = true;
    }
    if((!remarqueTrigger) && (solutionFound == true) && (audioMedia.checkIfAudioEnded())) {
        remarqueTrigger = true;
    }

    if(remarqueTrigger) {
        triangleIsocele.showAllMediatriceAB(sketch)
    }    
    if(remarqueTrigger && once) {
        once = false;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/23_remarque_2_isocele.wav")
    }
    if(remarqueTrigger && audioMedia.checkIfAudioEnded()) {
        goDefaultNextStep = true;
    }
    
    if (goDefaultNextStep == true) {
        sleep(2000)
        onExit()
        return "mediatriceHauteurEquilateral"
    }
    return "doHauteurOnIsocele"
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function onEnter(balls) {
    firstRun = false;
    let b1 = new Ball(1042, 411)
    let b2 = new Ball(787, 340)
    let b3 = new Ball(813, 746)
    triangleIsocele = new Triangle(b1, b2, b3)
    console.log(triangleIsocele)
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/8_Tres_bien_maintenant.wav")
    startTime = millis()
}

function onExit() {
    startTime = 0;
    solutionTrigger = false;
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function doHauteurOnIsoceleReset() {
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