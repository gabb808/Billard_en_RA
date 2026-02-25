
export class Particles{
  constructor(x,y){
     this.pos = createVector(x,y);
     this.vel = createVector(random(-5,5),random(-5,5));
     this.slow = 0.991;
     this.fade = 0.9;
     this.color = createVector(random(0,255),random(0,255),random(0,255));
     this.alpha = 255;
   }
   displayParticle(){
     this.pos = createVector(this.pos.x + this.vel.x,this.pos.y + this.vel.y);
     this.vel.mult(this.slow);
  
  }
   show(sketch){
     sketch.stroke(color(this.color.x,this.color.y,this.color.z,this.alpha));
     sketch.strokeWeight(5);
     //sketch.noStroke();
     //sketch.fill(color(this.color.x,this.color.y,this.color.z,this.alpha));
     sketch.point(this.pos.x,this.pos.y);
     sketch.circle(this.pos.x,this.pos.y,10);
     this.alpha = this.alpha * this.slow;
   }
   }








   