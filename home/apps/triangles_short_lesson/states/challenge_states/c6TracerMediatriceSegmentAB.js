import {
    audioMedia,
    navBar
} from "../../display.js";
import {
    addPoint
} from "../challenge.js";
import {
    Ball
} from "../../components/ball.js";
import {
    Triangle
} from "../../components/triangle.js";

let goDefaultNextStep = false;
let firstRun = true;
let endEnonce = false;

let found = false;
let once = true;

let startTime = 0;
let foundTime = 0;
let timeToWait = 2000; // in ms
let solutionTime = 20000; // in ms
let goEndTime = false;

let showSolution = false;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

let Ax = 800
let Ay = 3*height / 8
let Bx = 1300
let By = 6 * height / 8

let point1_x, point1_y, point2_x, point2_y, H1, H2, I1, I2, J1, J2, K1, K2, A1, A2, A3, helpPoint

export function c6TracerMediatriceSegmentABShow(sketch, f, balls, round) {
    if (firstRun) {
        onEnter(balls, round)
    }
    showAudioButtons(sketch)

    if (!endEnonce && audioMedia.checkIfAudioEnded()) {
        endEnonce = true;
    }

    if(!showSolution && endEnonce == true && millis() - startTime > solutionTime) {
        showSolution = true;
        audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/39_voici_la_solution.wav")
    }

    draw_segment(sketch, f)
    if(!found && !showSolution) {
        placeMediatrice(sketch, balls)
    }
    else {
        displaySolution(sketch)
    }

    if (found == true && endEnonce == true && once == true) {
        foundTime = millis()
        once = false;
        // audioMedia.stopSound()
        audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/correct_sound.wav")
        addPoint(1)
    }
    if ((found||showSolution) && audioMedia.checkIfAudioEnded()) {
        goEndTime = true
    }
    if (goEndTime) {
        if (millis() - foundTime > timeToWait) {
            goDefaultNextStep = true
        }
    }

    if (goDefaultNextStep == true) {
        onExit()
        return "c4TracerMediatricesTriangle"
    }
    return "c6TracerMediatriceSegmentAB"
}

function onEnter(balls, round) {
    firstRun = false;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/challenge/34_defi_consigne_mediatrice_AB.wav")
    if(!round) {
        console.log("here")
        Ax = 500
        Bx = 1300
        Ay = 4*height/8
        By = 5*height/8
    }
    computeSolution(balls)
    startTime = millis()
}

function onExit() {
    firstRun = true;
    goDefaultNextStep = false;
    endEnonce = false;
    found = false;
    once = true;
    goEndTime = false;
    showSolution = false;
    audioMedia.stopSound()
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

function draw_segment(sketch, f) {
    sketch.textFont(f, 60);
    sketch.stroke(255);
    sketch.strokeWeight(5);
    sketch.fill(255);
    sketch.line(Ax, Ay, Bx, By)
    sketch.text("A", Ax - 45 - 5, Ay + 8)
    sketch.text("B", Bx + 40, By + 8)
    sketch.circle(Ax, Ay, 10)
    sketch.circle(Bx, By, 10)
}


function placeMediatrice(sketch, balls) {
    if (balls.ball_nb >= 2) {
        sketch.push()
        sketch.translate(width, height)
        sketch.rotate(sketch.PI);
        sketch.stroke(255, 0, 0);
        sketch.line(balls.balls[0].x, balls.balls[0].y, balls.balls[1].x, balls.balls[1].y)
        sketch.pop()

        let A_balls_ref = createVector(-(Ax - width), -(Ay - height))
        let B_balls_ref = createVector(-(Bx - width), -(By - height))
        let tolerance = 70

        // sketch.text(Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[0].x, balls.balls[0].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[0].x, balls.balls[0].y)), 150, 250);
        // sketch.text(Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[1].x, balls.balls[1].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[1].x, balls.balls[1].y)), 150, 300);
        // console.log(mediatriceFound)

        if (found == false && endEnonce && Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[0].x, balls.balls[0].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[0].x, balls.balls[0].y)) < tolerance && Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[1].x, balls.balls[1].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[1].x, balls.balls[1].y)) < tolerance) {
            // sketch.text("Bravo !", 150, 250);
            found = true
            // audioMedia.stopSound()
            // audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/7_Bravo_tu_as_trouve.wav")
        }
    }
}

function computeSolution(balls)
{
    let mAB = (By - Ay) / (Bx - Ax)
    let x_middle_AB = (Ax + Bx) / 2
    let y_middle_AB = (Ay + By) / 2
    let mMediatrice_correct = -1 / mAB
    let nMediatrice_correct = y_middle_AB - mMediatrice_correct * x_middle_AB
    point1_x = 300
    point1_y = mMediatrice_correct * point1_x + nMediatrice_correct

    point2_x = 1800
    point2_y = mMediatrice_correct * point2_x + nMediatrice_correct

    let middle = balls.intersectPoint(createVector(point1_x, point1_y), createVector(point2_x, point2_y), createVector(Ax, Ay), createVector(Bx, By))
    
    //COMPUTE || coordinnates between this.triangle[0] and this.triangle[2] (middle3)
    let k = 0.05
    // 1st double line
    let E1 = createVector((Ax + middle.x) / 2, (Ay + middle.y) / 2)

    let F1 = createVector(E1.x + k * (Ax - E1.x), E1.y + k * (Ay - E1.y))
    let G1 = createVector(E1.x - k * (Ax - E1.x), E1.y - k * (Ay - E1.y))

    let extremityF1_1 = calculatePerpendicularBisector2(F1, createVector(Ax, Ay))
    let extremityF1_2 = createVector(F1.x - (extremityF1_1.x - F1.x), F1.y - (extremityF1_1.y - F1.y))

    let extremityG1_1 = calculatePerpendicularBisector2(G1, middle)
    let extremityG1_2 = createVector(G1.x - (extremityG1_1.x - G1.x), G1.y - (extremityG1_1.y - G1.y))
    k=0.1
    H1 = createVector(F1.x + k * (extremityF1_1.x - F1.x), F1.y + k * (extremityF1_1.y - F1.y))
    H2 = createVector(F1.x + k * (extremityF1_2.x - F1.x), F1.y + k * (extremityF1_2.y - F1.y))

    I1 = createVector(G1.x + k * (extremityG1_1.x - G1.x), G1.y + k * (extremityG1_1.y - G1.y))
    I2 = createVector(G1.x + k * (extremityG1_2.x - G1.x), G1.y + k * (extremityG1_2.y - G1.y))

    // 2nd double line
    k=0.05
    let E2 = createVector((Bx + middle.x) / 2, (By + middle.y) / 2)
    
    let F2 = createVector(E2.x + k * (Bx - E2.x), E2.y + k * (By - E2.y))
    let G2 = createVector(E2.x - k * (Bx - E2.x), E2.y - k * (By - E2.y))

    let extremityF2_1 = calculatePerpendicularBisector2(F2, createVector(Bx, By))
    let extremityF2_2 = createVector(F2.x - (extremityF2_1.x - F2.x), F2.y - (extremityF2_1.y - F2.y))

    let extremityG2_1 = calculatePerpendicularBisector2(G2, middle)
    let extremityG2_2 = createVector(G2.x - (extremityG2_1.x - G2.x), G2.y - (extremityG2_1.y - G2.y))

    k=0.1
    J1 = createVector(F2.x + k * (extremityF2_1.x - F2.x), F2.y + k * (extremityF2_1.y - F2.y))
    J2 = createVector(F2.x + k * (extremityF2_2.x - F2.x), F2.y + k * (extremityF2_2.y - F2.y))

    K1 = createVector(G2.x + k * (extremityG2_1.x - G2.x), G2.y + k * (extremityG2_1.y - G2.y))
    K2 = createVector(G2.x + k * (extremityG2_2.x - G2.x), G2.y + k * (extremityG2_2.y - G2.y))

    // right symbol:
    k = 0.07
    // let A1 = createVector(Ax + k * (middle.x - Ax), Ay + k * (middle.y - Ay))
    A1 = createVector(middle.x + k * (Ax - middle.x), middle.y + k * (Ay - middle.y))
    A2 = createVector(middle.x + k * (point1_x - middle.x), middle.y + k * (point1_y - middle.y))
    A3 = createVector(A2.x + (A1.x - middle.x), A2.y + (A1.y - middle.y))

    helpPoint = createVector((point1_x+middle.x)/2, (point1_y+middle.y)/2)
}

function displaySolution(sketch) {
    sketch.stroke(255, 0, 255);
    sketch.line(H1.x, H1.y, H2.x, H2.y)
    sketch.line(I1.x, I1.y, I2.x, I2.y)
    sketch.line(J1.x, J1.y, J2.x, J2.y)
    sketch.line(K1.x, K1.y, K2.x, K2.y)
    sketch.line(A2.x, A2.y, A3.x, A3.y)
    sketch.line(A3.x, A3.y, A1.x, A1.y)

    //purple
    sketch.stroke(255, 0, 255);
    sketch.fill(255, 0, 255);
    sketch.line(point1_x, point1_y, point2_x, point2_y)
    sketch.text('(D)', point1_x - 45 - 5, point1_y + 70)
}



function calculatePerpendicularBisector2(i, j) {
    let u = createVector(j.x - i.x, j.y - i.y)
    let v = createVector(-u.y, u.x)
    return createVector(v.x + i.x, v.y + i.y)
}