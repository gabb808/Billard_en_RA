//class that creates somme little dotes on the background
export class Dot{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
  
  show(sketch){
    sketch.fill(30, 144, 255, 160);
    sketch.noStroke();
    sketch.circle(this.x,this.y,2);
  }

}
