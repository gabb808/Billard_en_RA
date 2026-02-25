import {StarGalax} from "./starGalax.js"
export class Galaxy{
  constructor(nbOfstars){
    this.nbOfstars = nbOfstars;
    this.stars = this.generate();
    this.angle = PI;
  }
  
  generate(){
    let stars_rep = [];
    for(let i=0; i<this.nbOfstars; i++){
      let radiusw = 5 + i*0.2;
      let radiush = radiusw/2;
      let star = new StarGalax(radiusw,radiush);
      stars_rep.push(star);
    }
    return stars_rep;
  }
  
  moveGalaxy(sketch){
    for(let i=0; i<this.stars.length; i++){
      sketch.push();
      sketch.translate(width/2,height/2);
      sketch.rotate((this.angle/this.nbOfstars)*i);
      this.stars[i].display(sketch);
      sketch.pop();
      

    }
  }
}
