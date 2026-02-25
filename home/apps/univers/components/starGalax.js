//this class creates every little dot that moves for the galaxy
export class StarGalax{
  constructor(radiusw,radiush){
    this.radiusw = radiusw;
    this.radiush = radiush;
    this.theta = random(2*PI);
    this.velocity = 0.0015;
  }
  
  
  display(sketch){
  this.theta = this.theta + this.velocity;
  let x = (this.radiusw/2)*cos(this.theta);
  let y = (this.radiush/2)*sin(this.theta);
  sketch.noStroke();
  sketch.fill(221,160,221,125);
  sketch.circle(x,y,4);

  }
}
