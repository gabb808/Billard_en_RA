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
let firstHelpAudio = false;
let helpTrigger = false;
let solutionTrigger = false;
let numberOfmediatriceFound = 0;
let endTrigger = false;

let perpendicularABfound = false
let perpendicularBCfound = false
let perpendicularACfound = false

let triangle

export function mediatricePracticeTriangleShow(sketch, f, balls) {
    if (firstRun) {
        onEnter(balls)
    }
    showAudioButtons(sketch)

    //DRAWING SETUP
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Médiatrice", width/2, 150);

    sketch.textFont(f, 42);
    sketch.text(`Trouvées : ${numberOfmediatriceFound}/3`, width/2, 220);

    if (firstAudio && audioMedia.checkIfAudioEnded()) {
        firstAudio = false;
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/9_mediatrices_triangle_practice.wav")
    }

    triangle.show(sketch)
    triangle.showLetter(sketch, f)

    if (perpendicularABfound) {
        triangle.showAllMediatriceAB(sketch)
    } else {
        perpendicularABfound = triangle.placeMediatriceAB(balls)
        if (perpendicularABfound) {
            numberOfmediatriceFound++
        }
    }
    if (perpendicularBCfound) {
        triangle.showAllMediatriceBC(sketch)
    } else {
        perpendicularBCfound = triangle.placeMediatriceBC(balls)
        if (perpendicularBCfound) {
            numberOfmediatriceFound++
        }
    }
    if (perpendicularACfound) {
        triangle.showAllMediatriceAC(sketch)
    } else {
        perpendicularACfound = triangle.placeMediatriceAC(balls)
        if (perpendicularACfound) {
            numberOfmediatriceFound++
        }
    }
    if (!perpendicularABfound || !perpendicularBCfound || !perpendicularACfound) {
        showAttempLine(sketch, balls)
    }

    if (endTrigger == false && numberOfmediatriceFound == 3) {
        endTrigger = true;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/7_Bravo_tu_as_trouve.wav")
    }
    if (endTrigger == true && audioMedia.checkIfAudioEnded()) {
        goDefaultNextStep = true;
    }
    // if ((helpTrigger == false) && (millis() - startTime > 20000)) {
    //     helpTrigger = true;
    //     audioMedia.stopSound();
    //     audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/4_aide_mediatrice.wav")
    //     firstHelpAudio = true;
    // }
    // if (firstHelpAudio && audioMedia.checkIfAudioEnded()) {
    //     firstHelpAudio = false;
    //     audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/9_mediatrices_triangle_practice.wav")
    // }
    // if(helpTrigger && solutionTrigger==false && perpendicularACfound==false) {
    //     triangle.showHelpMediatricePoint(sketch)
    // }

    if ((solutionTrigger == false) && (millis() - startTime > 30000)) {
        solutionTrigger = true;
        audioMedia.stopSound();
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/9_bis_solution_mediatrices_ABC.wav")
    }
    
    if (solutionTrigger == true) {
        triangle.showAllMediatriceAB(sketch)
        triangle.showAllMediatriceBC(sketch)
        triangle.showAllMediatriceAC(sketch)
        if(audioMedia.checkIfAudioEnded()) {
            goDefaultNextStep = true;
        }
    }

    if (goDefaultNextStep == true) {
        sleep(1000)
        onExit()
        return "hauteurLessonInside"
    }
    return "mediatricePracticeTriangle"
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
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/8_Tres_bien_maintenant.wav")
    startTime = millis()
}

function onExit() {
    startTime = 0;
    helpTrigger = false;
    solutionTrigger = false;
    perpendicularABfound = false;
    perpendicularBCfound = false;
    perpendicularACfound = false;
    numberOfmediatriceFound = 0;
    endTrigger = false;
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function mediatricePracticeTriangleReset() {
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