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
let firstAudio = true;

let triangleIsocele;
let triangleEquilateral;

let isoceleTextTime = 9;
let equilateralTextTime = 10.7;
let isoceleSymbolTime = 2.2;
let equilateralSymbolTime = 7;

let showIsoceleText = false
let showEquilateralText = false
let showIsoceleSymbol = false
let showEquilateralSymbol = false

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

export function rappelTrianglesIsocelesEquilaterauxShow(sketch, f, balls) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    if (firstAudio && audioMedia.getAudioTime() > isoceleTextTime) {
        showIsoceleText = true
    }
    if (firstAudio && audioMedia.getAudioTime() > equilateralTextTime) {
        showEquilateralText = true
    }
    if (!firstAudio && audioMedia.getAudioTime() > isoceleSymbolTime) {
        showIsoceleSymbol = true
    }
    if (!firstAudio && audioMedia.getAudioTime() > equilateralSymbolTime) {
        showEquilateralSymbol = true
    }

    if (firstAudio && audioMedia.checkIfAudioEnded()) {
        firstAudio = false;
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/18_rappel_triangles_isocèle_equilateral.wav")
    }
    if (!firstAudio && audioMedia.checkIfAudioEnded()) {
        goDefaultNextStep = true;
    }

    //WRITE YOUR CODE HERE
    sketch.stroke(255);
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Triangles isocèles & équilatéraux", width / 2, 150);

    sketch.push()
    sketch.translate(-150, 140)
    sketch.scale(0.8)
    triangleIsocele.show(sketch)
    if (showIsoceleSymbol) {
        triangleIsocele.showIsoceleEqualSymbols(sketch)
    }
    sketch.pop()
    sketch.push()
    sketch.translate(1 * width / 4 + 140, 3 * height / 4 + 50)
    sketch.textFont(f, 50);
    if(showIsoceleText) {
        sketch.text("Isocèle", 0, 0)
    }
    sketch.pop()

    sketch.push()
    sketch.translate(550, 150)
    sketch.scale(0.8)
    if (showEquilateralSymbol) {
        triangleEquilateral.showEquilateralEqualSymbols(sketch)
    }
    triangleEquilateral.show(sketch)
    sketch.pop()
    sketch.push()
    sketch.translate(3 * width / 4 - 110, 3 * height / 4 + 50)
    sketch.textFont(f, 50);
    if(showEquilateralText) {
        sketch.text("Equilatéral", 0, 0)
    }
    sketch.pop()

    if (goDefaultNextStep == true) {
        sleep(2500)
        onExit()
        return "doMediatriceOnIsocele"
    }
    return "rappelTrianglesIsocelesEquilateraux"
}

function onEnter() {
    firstRun = false;
    //Isocele triangle
    let b1 = new Ball(width / 2 - 200, height / 2 + 200)
    let b2 = new Ball(width / 2 + 200, height / 2 + 200)
    let b3 = new Ball(width / 2, height / 2 - 300)
    triangleIsocele = new Triangle(b1, b2, b3)

    //Equilateral triangle
    let b4 = new Ball(width / 2 - 200, height / 2 + 200)
    let b5 = new Ball(width / 2 + 200, height / 2 + 200)
    let b6 = new Ball(width / 2, height / 2 - 149)
    triangleEquilateral = new Triangle(b4, b5, b6)

    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/17_rappel_triangles_particuliers.wav")
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function rappelTrianglesIsocelesEquilaterauxReset() {
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
    if (repeat == false) {
        repeatTrigger = false;
    }
}