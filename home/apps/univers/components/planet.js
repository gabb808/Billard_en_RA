//this class creates the planets of the solarsystem
export class Planet{
  constructor(xsun, ysun, xplanet, yplanet, r, radiusw, radiush, velocity, theta, color,anneau) {
  this.xsun = xsun;
  this.ysun = ysun;
  this.xplanet = xsun + xplanet;//put planets next to the sun
  this.yplanet = ysun + yplanet;
  this.r = r;
  this.velocity = velocity;
  this.radiusw = radiusw;
  this.radiush = radiush;
  
  this.theta = theta;
  this.color = color;
  this.anneau = anneau;
  }
  
  move(){ //function moves planets around the sun
    this.theta = this.theta + this.velocity;
    this.xplanet = this.xsun + this.radiusw * cos(this.theta);
    this.yplanet = this.ysun + this.radiush * sin(this.theta);  
  }
  
  show(sketch) {
    sketch.noFill();
    sketch.stroke(255,100);
    sketch.ellipse(0,0,this.radiusw,this.radiush); //ellipse for the mouvement of the planet
    sketch.fill(this.color[0],this.color[1],this.color[2],255);
    sketch.circle(this.xplanet,this.yplanet,this.r); //creates the planet
    
  }
  
  showAnneau(sketch) {//this is to put ellipse around some of the planets 
    
    sketch.noFill();
    sketch.stroke(255);
    sketch.ellipse(this.xplanet, this.yplanet, 2.5 * this.r, this.r);
    
  }
  
  showSun(sketch) {
    sketch.noFill();
    sketch.stroke(255,100);
    sketch.fill(this.color[0],this.color[1],this.color[2],255);
    sketch.circle(0, 0, this.r);

  }

}
