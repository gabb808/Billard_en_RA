import {
    audioMedia,
    navBar
} from "../display.js"

let goDefaultNextStep = false;
let firstRun = true;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

let equalSymbolTime = 11;
let rightSymbolTime = 18.5;

export function mediatriceLessonSegmentShow(sketch, f) {
    if (firstRun) {
        onEnter()
    }
    showAudioButtons(sketch)

    //DRAWING SETUP
    sketch.stroke(255)
    sketch.fill(255);
    sketch.textFont(f, 70);
    sketch.textAlign(sketch.CENTER)
    sketch.text("Médiatrice", width/2, 150);

    //Drawing the mediatrice
    draw_segment(sketch, f)
    draw_mediatrice(sketch, f)
    showSymbols(sketch)

    if (goDefaultNextStep == true) {
        onExit()
        return "mediatriceLessonTriangle"
        // return "end"
    }
    return "mediatriceLessonSegment"
}

function onEnter() {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/1_mediatrices_segment_def.wav")
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    audioMedia.stopSound()
}

export function mediatriceLessonSegmentReset() {
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


function draw_segment(sketch, f) {
    sketch.textFont(f, 60);
    sketch.stroke(255);
    sketch.strokeWeight(5);
    sketch.line(width / 3, height / 2, 2 * width / 3, height / 2)
    sketch.line(2 * width / 3, height / 2 + 18, 2 * width / 3, height / 2 - 18)
    sketch.line(width / 3, height / 2 + 18, width / 3, height / 2 - 18)
    sketch.text("A", width / 3 - 45 - 5, height / 2 + 8)
    sketch.text("B", 2 * width / 3 + 45, height / 2 + 8)
}

function draw_mediatrice(sketch, f) {
    sketch.textFont(f, 60);
    sketch.stroke(255, 0, 255);
    sketch.fill(255, 0, 255);
    sketch.line(width / 2, 1.5*height / 8, width / 2, 7 * height / 8)
    sketch.text("(D)", width / 2 + 50, 1.8 * height / 8)

    // sketch.line(7*width/12, height/2 + 20, 7*width/12, height/2-20)
    sketch.line(7 * width / 12 - 8, height / 2 + 20, 7 * width / 12 - 8, height / 2 - 20)
    sketch.line(7 * width / 12 + 8, height / 2 + 20, 7 * width / 12 + 8, height / 2 - 20)

    // sketch.line(5*width/12, height/2 + 20, 5*width/12, height/2-20)
    sketch.line(5 * width / 12 - 8, height / 2 + 20, 5 * width / 12 - 8, height / 2 - 20)
    sketch.line(5 * width / 12 + 8, height / 2 + 20, 5 * width / 12 + 8, height / 2 - 20)

    //right angle symbol
    sketch.line(width / 2, height / 2 - 30, width / 2 + 30, height / 2 - 30)
    sketch.line(width / 2 + 30, height / 2 - 30, width / 2 + 30, height / 2)
}

function showSymbols(sketch) {
    if (audioMedia.getAudioTime() > equalSymbolTime && audioMedia.getAudioTime() < rightSymbolTime) {
        sketch.push()
        sketch.translate(7.5 * width / 12, 1.3 * height / 2)
        sketch.stroke(255, 255, 0)
        sketch.strokeWeight(10)
        sketch.line(-10, 0, -53, -105)
        sketch.fill(255, 255, 0)
        sketch.strokeWeight(0)
        sketch.triangle(-65, -130, -70, -95, -35, -112)
        sketch.pop()
        sketch.push()
        sketch.translate(5.5 * width / 12, 1.3 * height / 2)
        sketch.stroke(255, 255, 0)
        sketch.strokeWeight(10)
        sketch.line(-10, 0, -53, -105)
        sketch.fill(255, 255, 0)
        sketch.strokeWeight(0)
        sketch.triangle(-65, -130, -70, -95, -35, -112)
        sketch.pop()
    }
    if (audioMedia.getAudioTime() > rightSymbolTime) {
        sketch.push()
        sketch.translate(6.9 * width / 12, 0.74 * height / 2)
        sketch.rotate(radians(200))
        sketch.scale(-1, 1)
        sketch.stroke(255, 255, 0)
        sketch.strokeWeight(10)
        sketch.line(-10, 0, -53, -105)
        sketch.fill(255, 255, 0)
        sketch.strokeWeight(0)
        sketch.triangle(-65, -130, -70, -95, -35, -112)
        sketch.pop()
    }
}