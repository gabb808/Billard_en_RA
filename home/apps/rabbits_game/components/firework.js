import {Particles} from "./particles.js"

export class Fireworks{
    constructor(x,y){
      this.pos = createVector(x,y);
      this.particles = [];
      for(let i=0; i<100;i++){
        let particle = new Particles(this.pos.x,this.pos.y);
        this.particles.push(particle);
      }
    }
    
    showFirework(sketch){
      for(let i=0; i<this.particles.length;i++){
        this.particles[i].show(sketch);
        this.particles[i].displayParticle();
      }
    }
    
   
  }



















  