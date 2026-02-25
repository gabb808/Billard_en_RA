export class Dot{
    constructor(){
      this.pos = createVector(random(width),random(height));
      this.color = createVector(random(0,255),random(0,255),random(0,255));
      this.vel = createVector(random(-2,2),random(-2,2));
    }
    
    updateDot(){
      this.pos.add(this.vel);
      if(this.pos.x>width){
        this.pos.x = 0;
      }
      if(this.pos.y>height){
       this.pos.y = 0;
      }
      if(this.pos.y<0){
      this.pos.y = height;
      }
      if(this.pos.x<0){
        this.pos.x=width;
      }  
      
    }
    getPos(){
      return this.pos;
    }
    
    showDot(sketch){
      sketch.stroke(this.color.x,this.color.y,this.color.z);
      sketch.strokeWeight(7);
      sketch.circle(this.pos.x,this.pos.y,7);
    }
  }