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

let size = 200;
let angle_triangle_perpendicular_bijector = 0;
let angle_segment = 10;
let angle_triangle_altitude = 0;
let x_triangle_perpendicular_bijector = 1200
let x_segment = -size
let x_triangle_altitude = 400

let waitingTimeAfterAudio = 10000; //milliseconds
let endAudioTime = 0; //milliseconds
let audioEnded = false;

export function curtainShow(sketch, f, beginning = true) {
  if (firstRun) {
    onEnter(beginning)
  }
  
  showAudioButtons(sketch)
  
  if (audioMedia.checkIfAudioEnded()) {
    endAudioTime = millis()
    audioEnded = true;
  }
  if (audioEnded && millis() - endAudioTime > waitingTimeAfterAudio) {
    goDefaultNextStep = true;
  }
  console.log(goDefaultNextStep)

  sketch.angleMode(RADIANS)
  rotating_triangle_perpendicular_bijector(sketch)
  rotating_triangle_altitude(sketch)
  rotating_segment(sketch)

  angle_triangle_altitude += 0.002;
  angle_triangle_perpendicular_bijector += 0.003;
  angle_segment -= 0.005;
  x_triangle_perpendicular_bijector += 1;
  x_segment += 1;
  x_triangle_altitude += 1;

  if (x_triangle_perpendicular_bijector > width + size) {
    x_triangle_perpendicular_bijector = -size
  }
  if (x_segment > width + size) {
    x_segment = -size
  }
  if (x_triangle_altitude > width + size) {
    x_triangle_altitude = -size
  }

  sketch.stroke(255)
  sketch.fill(255);
  sketch.textFont(f, 70);
  sketch.textAlign(sketch.CENTER)
  if(beginning){
    sketch.text("Introduction", width / 2, 150);
  } else {
    sketch.text("Fin", width / 2, 150);
  }

  if (goDefaultNextStep == true) {
    onExit()
    if (beginning) {
      return "mediatriceLessonSegment"
    } else {
      return "end"
    }
  }
  if (beginning) {
    return "introduction"
  } else {
    return "outro"
  }
}

function sleep(delay) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

function onEnter(beginning) {
  if (beginning) {
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/0_intro.wav")
    waitingTimeAfterAudio = 0; //milliseconds
  } else {
    audioMedia.playSound("./platform/home/apps/triangles_full_lesson/assets/38_leçon_finie.wav")
    waitingTimeAfterAudio = 10000; //milliseconds
  }
  firstRun = false;
}

function onExit() {
  firstRun = true;
  goDefaultNextStep = false;
  audioEnded = false;
  endAudioTime = 0;
  audioMedia.stopSound()
}

export function curtainReset() {
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

function rotating_triangle_perpendicular_bijector(sketch) {
  sketch.push();
  sketch.translate(x_triangle_perpendicular_bijector, 500)
  sketch.rotate(angle_triangle_perpendicular_bijector);
  sketch.noFill();

  //Triangle
  sketch.stroke(255)
  sketch.strokeWeight(5)
  sketch.triangle(0, 0, size, 0, 0, size);

  //Perpendicular bisector
  sketch.stroke(255, 0, 255)
  sketch.strokeWeight(3)
  sketch.line(-20, -20, size * 2 / 3, size * 2 / 3)

  // equidistance markers
  sketch.strokeWeight(3)
  //circle(1/4 * size, 3/4 * size, 10)

  //line(3/4 * size-10, 1/4 * size-10, 3/4 * size+10, 1/4 * size+10)
  sketch.line(3 / 4 * size - 10 - 2, 1 / 4 * size - 10 + 2, 3 / 4 * size + 10 - 2, 1 / 4 * size + 10 + 2)
  sketch.line(3 / 4 * size - 10 + 2, 1 / 4 * size - 10 - 2, 3 / 4 * size + 10 + 2, 1 / 4 * size + 10 - 2)

  sketch.line(1 / 4 * size - 10 - 2, 3 / 4 * size - 10 + 2, 1 / 4 * size + 10 - 2, 3 / 4 * size + 10 + 2)
  sketch.line(1 / 4 * size - 10 + 2, 3 / 4 * size - 10 - 2, 1 / 4 * size + 10 + 2, 3 / 4 * size + 10 - 2)

  sketch.pop();
}

// let Ax = random(500)
// let Ay = random(500)
// let Bx = random(500)
// let By = random(500)
// let Cx = random(500)
// let Cy = random(500)

function rotating_triangle_altitude(sketch) {
  let Ax = 307
  let Ay = 459
  let Bx = 247
  let By = 97
  let Cx = 198
  let Cy = 191
  // console.log(Ax, Ay, Bx, By, Cx, Cy)

  //ROTATING RANDOM TRIANGLE WITH HAUTEUR
  sketch.push();
  sketch.translate(x_triangle_altitude, 500)
  sketch.rotate(angle_triangle_perpendicular_bijector);
  //translate(300,200)
  sketch.noFill();

  //Triangle
  sketch.stroke(255)
  sketch.strokeWeight(3)
  sketch.triangle(Ax, Ay, Bx, By, Cx, Cy);

  //altitudes
  sketch.stroke(0, 255, 0)
  sketch.strokeWeight(3)
  let [Hx, Hy, Ix, Iy, Jx, Jy] = get_triangle_altitudes_coordinates(Ax, Ay, Bx, By, Cx, Cy)

  //Extend altitudes lines for better visualization
  let k = 1.4 //extension coefficient
  let Hx_prime = (k * (Hx - Ax)) + Ax
  let Hy_prime = (k * (Hy - Ay)) + Ay
  let Ax_prime = (k * (Ax - Hx)) + Hx
  let Ay_prime = (k * (Ay - Hy)) + Hy

  let Ix_prime = (k * (Ix - Bx)) + Bx
  let Iy_prime = (k * (Iy - By)) + By
  let Bx_prime = (k * (Bx - Ix)) + Ix
  let By_prime = (k * (By - Iy)) + Iy

  let Jx_prime = (k * (Jx - Cx)) + Cx
  let Jy_prime = (k * (Jy - Cy)) + Cy
  let Cx_prime = (k * (Cx - Jx)) + Jx
  let Cy_prime = (k * (Cy - Jy)) + Jy

  // Draw altitudes
  sketch.line(Hx_prime, Hy_prime, Ax_prime, Ay_prime)
  sketch.line(Ix_prime, Iy_prime, Bx_prime, By_prime)
  sketch.line(Jx_prime, Jy_prime, Cx_prime, Cy_prime)

  // Draw right squares symbols
  // sketch.stroke(0,255,0)
  // sketch.strokeWeight(2)
  // let point1_x = Hx-(1/10)*(Hx_prime-Ax)
  // let point1_y = Hy-(1/10)*(Hy_prime-Ay)
  // sketch.circle(point1_x, point1_y, 10)
  // sketch.circle(Ix-(1/10)*(Ix_prime-Bx), Iy-(1/10)*(Iy_prime-By), 10)
  // sketch.circle(Jx-(1/10)*(Jx_prime-Cx), Jy-(1/10)*(Jy_prime-Cy), 10)

  // B est point1 et A est H
  // sketch.circle(Hx, Hy, 10)
  // let m = (point1_y - Hy) / (point1_x - Hx)
  // let Yx = point1_x
  // let Yy = -1/m * point1_x + Hy + 1/m * Hx
  // sketch.circle(Yx, Yy, 10)

  // console.log((Hx-(1/10)*(Cx-Bx), Hy-(1/10)*(Cy-By)))
  // sketch.circle(Hx-(1/10)*(Cx-Bx), Hy-(1/10)*(Cy-By), 10)
  // sketch.circle(Ix-(1/10)*(Cx-Ax), Iy-(1/10)*(Cy-Ay), 10)
  // sketch.circle(Jx-(1/10)*(Bx-Ax), Jy-(1/10)*(By-Ay), 10)

  // Draw dotted lines if required
  // sketch.drawingContext.setLineDash([5, 15]); //Doesn't work

  if (calculateAngle(Bx, By, Ax, Ay, Cx, Cy) > 90) { //BÂC is optus, draw dashlines is required
    let Lx = (k * (Ix - Ax)) + Ax
    let Ly = (k * (Iy - Ay)) + Ay

    let Mx = (k * (Jx - Ax)) + Ax
    let My = (k * (Jy - Ay)) + Ay

    //Draw dashlines
    sketch.stroke(10, 200, 10)
    sketch.strokeWeight(1)
    linedash(sketch, Ax, Ay, Lx, Ly, 10, '-')
    linedash(sketch, Ax, Ay, Mx, My, 10, '-')
  } else if (calculateAngle(Cx, Cy, Bx, By, Ax, Ay) > 90) { //BĈY is optus, draw dashlines is required
    let Lx = (k * (Hx - Bx)) + Bx
    let Ly = (k * (Hy - By)) + By

    let Mx = (k * (Jx - Bx)) + Bx
    let My = (k * (Jy - By)) + By

    //Draw dashlines
    sketch.stroke(10, 200, 10)
    sketch.strokeWeight(1)
    linedash(sketch, Bx, By, Lx, Ly, 10, '-')
    linedash(sketch, Bx, By, Mx, My, 10, '-')
  } else if (calculateAngle(Bx, By, Cx, Cy, Ax, Ay) > 90) { //CBY is optus, draw dashlines is required
    let Lx = (k * (Hx - Cx)) + Cx
    let Ly = (k * (Hy - Cy)) + Cy

    let Mx = (k * (Ix - Cx)) + Cx
    let My = (k * (Iy - Cy)) + Cy

    //Draw dashlines
    sketch.stroke(10, 200, 10)
    sketch.strokeWeight(1)
    linedash(sketch, Cx, Cy, Lx, Ly, 10, '-')
    linedash(sketch, Cx, Cy, Mx, My, 10, '-')
  }
  sketch.pop();
}

function linedash(sketch, x1, y1, x2, y2, delta, style = '-') {
  // delta is both the length of a dash, the distance between 2 dots/dashes, and the diameter of a round
  let distance = dist(x1, y1, x2, y2);
  let dashNumber = distance / delta;
  let xDelta = (x2 - x1) / dashNumber;
  let yDelta = (y2 - y1) / dashNumber;

  for (let i = 0; i < dashNumber; i += 2) {
    let xi1 = i * xDelta + x1;
    let yi1 = i * yDelta + y1;
    let xi2 = (i + 1) * xDelta + x1;
    let yi2 = (i + 1) * yDelta + y1;

    if (style == '-') {
      sketch.line(xi1, yi1, xi2, yi2);
    } else if (style == '.') {
      sketch.point(xi1, yi1);
    } else if (style == 'o') {
      sketch.ellipse(xi1, yi1, delta / 2);
    }
  }
}

function rotating_segment(sketch) {
  // //ROTATING SEGMENT
  sketch.push();
  sketch.translate(x_segment, 750)
  sketch.rotate(angle_segment);

  sketch.stroke(255)
  sketch.strokeWeight(3)
  sketch.line(0, 0, size, 0)
  sketch.line(0, -15, 0, 15)
  sketch.line(size, -15, size, 15)
  sketch.pop();
}

function get_triangle_altitudes_coordinates(Ax, Ay, Bx, By, Cx, Cy) {
  let mAB = (By - Ay) / (Bx - Ax)
  let mBC = (Cy - By) / (Cx - Bx)
  let mAC = (Cy - Ay) / (Cx - Ax)

  let bAB = Ay - mAB * Ax
  let bBC = By - mBC * Bx
  let bAC = Ay - mAC * Ax


  // if (firstRun == 0)
  // {console.log("(AB) : y = " + mAB + "x + " + bAB)
  // console.log("(BC) : y = " + mBC + "x + " + bBC)
  // console.log("(AC) : y = " + mAC + "x + " + bAC)
  // }

  let mAH = -1 / mBC
  let mBI = -1 / mAC
  let mCJ = -1 / mAB

  let bAH = Ay - mAH * Ax
  let bBH = By - mBI * Bx
  let bCH = Cy - mCJ * Cx

  // if (firstRun == 0)
  // {console.log("(AH) : y = " + mAH + "x + " + bAH)
  // console.log("(BI) : y = " + mBI + "x + " + bBH)
  // console.log("(CJ) : y = " + mCJ + "x + " + bCH)
  // firstRun = 1
  // }

  //intersection (BC) with (AH)
  let Hx = (bAH - bBC) / (mBC - mAH)
  let Hy = mBC * Hx + bBC

  //intersection (AC) with (BH)
  let Ix = (bBH - bAC) / (mAC - mBI)
  let Iy = mAC * Ix + bAC

  //intersection (AB) with (CH)
  let Jx = (bCH - bAB) / (mAB - mCJ)
  let Jy = mAB * Jx + bAB

  // let AB = get_distance(Ax, Ay, Bx, By)
  // let BC = get_distance(Bx, By, Cx, Cy)
  // let AC = get_distance(Ax, Ay, Cx, Cy)
  // 
  // let a = AC
  // let b = AB
  // let c = BC
  // 
  // let x = (a*a*(b*b+c*c-a*a))/(2*b*c)
  // let y = sqrt(a*a-x*x)
  // 
  // let Hx = (x*(Bx-Cx)+Cx)
  // let Hy = (x*(By-Cy)+Cy)
  // let Ix = (y*(Cx-Ax)+Ax)
  // let Iy = (y*(Cy-Ay)+Ay)
  // 

  // if(firstRun == 0)
  // {
  //   console.log("Hx,Hy,Ix,Iy, Jx, Jy", Hx,Hy,Ix,Iy, Jx, Jy)
  // }

  return [Hx, Hy, Ix, Iy, Jx, Jy]
}

// function calculateAngle(p1,p2,p3) {
//   let AB = distanceOf2Balls(this.triangle[p1],this.triangle[p2]);
//   let BC = distanceOf2Balls(this.triangle[p2],this.triangle[p3]);
//   let AC = distanceOf2Balls(this.triangle[p1],this.triangle[p3]);
//   return round(acos((BC**2 + AB**2 - AC**2)/(2*BC*AB)) * 180 / PI)
// }

// function distanceOf2Balls(p1,p2){
//   return round(dist(p1.x,p1.y,p2.x,p2.y),5)
// }

function calculateAngle(Ax, Ay, Bx, By, Cx, Cy) {
  let AB = get_distance(Ax, Ay, Bx, By)
  let BC = get_distance(Bx, By, Cx, Cy)
  let AC = get_distance(Ax, Ay, Cx, Cy)
  return round(acos((BC ** 2 + AB ** 2 - AC ** 2) / (2 * BC * AB)) * 180 / PI)
}

function get_distance(Ax, Ay, Bx, By) {
  return sqrt((Bx - Ax) ** 2 + (By - Ay) ** 2)
}