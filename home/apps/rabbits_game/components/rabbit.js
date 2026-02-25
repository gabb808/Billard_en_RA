import {Fireworks} from "./firework.js"
export class Rabbit{
  constructor(x,y,r,stateLife){
    this.x = x;
    this.y = y;
    this.r = r;
    let speed = [-2.5,-2.2,-1,1,2.2,2.5];

    this.xspeed1 = random(2,2.5);
    this.yspeed1 = random(speed);

    this.xspeed2 = 0;
    this.yspeed2 = 0;
    
    this.image = loadImage('./platform/home/apps/sandtable/components/crabe.png');
    this.stateLife = stateLife;
    this.deathTime = 0;
    this.angle = 0;
    this.alpha = 255;
  }
  move(){
    if(this.stateLife == true){
      this.x = this.x + this.xspeed1;
      this.y = this.y + this.yspeed1;
      if(this.x>width){
        this.x = 0;
      }
      if(this.y>height){
      this.yspeed1 = -(this.yspeed1);
      }
      if(this.y<0){
        this.yspeed1 = -(this.yspeed1);
      }
      if(this.x<0){
        this.x=width;
      }  
    }
    else{
      this.x = this.x + this.xspeed2;
      this.y = this.y + this.yspeed2;
      if(this.x>width){
        this.x = 0;
      }
      if(this.y>height){
      this.y = 0;
      }
      if(this.y<0){
      this.y = height;
      }
      if(this.x<0){
        this.x=width;
      }  
    }
  } 
  getR(){
    return this.r;
  }
  show(sketch){
    if(this.stateLife == true){
      
      this.firework = undefined;
      sketch.push();
      sketch.translate(this.x,this.y);
      sketch.rotate(this.angle);
      sketch.fill(173,255,47);
      sketch.noStroke();
      //head
      sketch.circle(0,0,70);
      sketch.ellipse(0,8,82,50)
      sketch.push();
      //ears
      sketch.rotate(PI/2.5);
      sketch.ellipse(-35,0,72,25);
      sketch.fill(80,200,120);
      sketch.ellipse(-45,0,32,15);
      sketch.pop();
      sketch.push();
      sketch.rotate(-PI/2.5);
      sketch.ellipse(35,0,72,25);
      sketch.fill(80,200,120);
      sketch.ellipse(45,0,32,15);
      sketch.pop();
      //teeth
      sketch.fill(255);
      sketch.rect(-6,23,5,15);
      sketch.rect(1,23,5,15);
      //eyes
      sketch.stroke(0);
      sketch.ellipse(-7,-10,10,20);
      sketch.ellipse(7,-10,10,20);
      sketch.fill(0);
      sketch.ellipse(-7,-5,8,10);
      sketch.ellipse(7,-5,8,10);
      //nose
      sketch.ellipse(0,8,8,5);
      sketch.line(0,8,0,18);
      sketch.fill(255);
      sketch.stroke(255);
      sketch.circle(-9,-8,2);
      sketch.circle(5,-8,2);
      //smile
      sketch.stroke(0);
      sketch.noFill();
      sketch.arc(0, 15, 0.6*30, 0.6*20, 0.1*PI, 0.9*PI);
      //steuch
      sketch.stroke(0);
      sketch.noFill();
      sketch.line(-45, -3, -22, 5);
      sketch.line(-45, 10, -22, 10);
      sketch.line(-45, 25, -22, 15);
      sketch.line(45, -3, 22, 5);
      sketch.line(45, 10, 22, 10);
      sketch.line(45, 25, 22, 15);
      sketch.pop();
      this.angle +=0.025;

    }
    else{
      if (this.firework == undefined){
        
      this.firework = new Fireworks(this.x,this.y);
      }
      this.firework.showFirework(sketch);
      sketch.fill(211,211,211,this.alpha);
      sketch.noStroke();  
      sketch.push();
      sketch.translate(this.x,this.y);
      sketch.scale(2);
      sketch.rect(-10,+11,20,15);
      sketch.circle(0, 0, 40);
      sketch.fill(0);
      sketch.circle(- 7,- 1, 10);
      sketch.circle(7, - 1, 10);     
      sketch.fill(0);
      sketch.rect(-4,18,3,9);
      sketch.rect(2,18,3,9);
      sketch.pop();
      this.xspeed = 0; 
      this.yspeed = 0;
      this.alpha = this.alpha -0.5;

    }
  }
   
}












