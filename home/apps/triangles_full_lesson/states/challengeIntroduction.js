// CREDITS : Exploding circle by Luxone, https://editor.p5js.org/Luxone/sketches/BkUl_rNY7

import {
  audioMedia,
  navBar
} from "../display.js"

var center = {
  x: 0,
  y: 0
}
var circles
let firstRun = true;
let goDefaultNextStep = false;
let buttonIsActivated = false;

let firstAudio = true;
let secondAudio = false;
let thirdAudio = false;

let pause = false;
let repeat = false;
let pauseTrigger = false;
let repeatTrigger = false;

center.x = width / 2;
center.y = height / 2;
/*
        How to create more circles:
    1) Add another line with a new number
    2) First two variables are center location
    3) Third variable is smaller circle radius
    4) Fouth variable is larger circle radius
    5) Fifth variable is the number of points on the circle
    6) Sixth variable is the size of points
*/

export function challengeIntroductionShow(sketch, f, balls) {
  if (firstRun == true) {
    // let str="onEnter"
    // eval(str)
    onEnter()
  }
  showAudioButtons(sketch)

  if (firstAudio && audioMedia.checkIfAudioEnded()) {
    firstAudio = false;
    secondAudio = true;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/26_perte_de_point_par_erreur_defi_intro.wav")
  }
  if (secondAudio && audioMedia.checkIfAudioEnded()) {
    secondAudio = false;
    thirdAudio = true;
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/27_start_defi_place_palet.wav")
  }
  if (thirdAudio && audioMedia.checkIfAudioEnded()) {
    thirdAudio = false;
  }


  sketch.stroke(255)
  sketch.fill(255);
  sketch.textFont(f, 100);
  sketch.textAlign(sketch.CENTER)
  sketch.text("Défi!", width / 2, 150);


  if (!firstAudio && !secondAudio && !thirdAudio) {
    sketch.textFont(f, 48);
    sketch.text("Place un palet dans le cercle pour commencer le défi!", sketch.width / 2, 3 * sketch.height / 4);
    sketch.stroke(255)
    sketch.strokeWeight(3)
    sketch.noFill()
    sketch.circle(width/2, height/2, 200)
    circles.present(sketch);
    for (let i = 0; i < balls.balls.length; i++) {
      if (dist(balls.balls[i].x, balls.balls[i].y, sketch.width / 2, sketch.height / 2) < 200 && buttonIsActivated == false) {
        buttonIsActivated = true;
        circles.activate();
      }
    }
  }

  if (goDefaultNextStep == true) {
    onExit()
    return "countdown"
  }
  return "challengeIntroduction"
}

function onEnter() {
  circles = new circle(center.x, center.y, 100, 1000, 60, 10);
  audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/25_2min_defi_intro.wav")
  firstRun = false;
}

function onExit() {
  circles = null;
  firstRun = true;
  buttonIsActivated = false;
  goDefaultNextStep = false;
}

export function challengeIntroductionReset() {
  onExit()
}

class circle {

  constructor(centerX, centerY, rLow, rBig, num, strokeWidth) {
    this.rLow = rLow;
    this.rBig = rBig;
    this.r = [];
    this.rgoal = rLow;
    this.num = num;
    this.cX = centerX;
    this.cY = centerY;
    this.speed = [];
    this.active = [];
    this.locX = [];
    this.locY = [];
    this.strokeWidth = strokeWidth;
    for (var i = 0; i < num; i++) {
      this.active[i] = false;
      this.r[i] = this.rLow;
      this.locX[i] = this.cX + cos((360 * i) / this.num) * this.rLow;
      this.locY[i] = this.cY + sin((360 * i) / this.num) * this.rLow;
    }
  }

  move() {
    for (var i = 0; i < this.num; i++) {
      if (this.active[i]) {
        this.r[i] += (this.rgoal - this.r[i]) / this.speed[i]; // update radius
        if ((this.r[i] > this.rBig) || (this.r[i] < this.rLow)) { // Check if in the boundaries
          this.r[i] = this.rgoal;
          this.active[i] = false;
        }
        this.locX[i] = this.cX + cos((360 * i) / this.num) * this.r[i];
        this.locY[i] = this.cY + sin((360 * i) / this.num) * this.r[i]; // Update location
      }
    }
    if (this.r[0] > this.rgoal - 0.02) {
      goDefaultNextStep = true
    }
  }

  isActive() {
    for (var i = 0; i < this.num; i++) {
      if (this.active[i]) {
        return true;
      }
    }
    return false;
  }

  activate() {
    if (this.rgoal == this.rLow) {
      this.rgoal = this.rBig;
    } else {
      this.rgoal = this.rLow;
    }
    for (var i = 0; i < this.num; i++) {
      this.active[i] = true;
      this.speed[i] = random(10, 50);
    }
  }

  present(sketch) {
    sketch.strokeWeight(this.strokeWidth);
    sketch.stroke(255, 200);
    if (this.isActive()) {
      this.move();
    }
    for (var i = 0; i < this.num; i++) {
      sketch.point(this.locX[i], this.locY[i]);
    }
  }
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