//this class creates the solarsystem
let tabColor = [[128, 128, 128], [250, 240, 180], [0, 127, 255], [178, 46, 32], [255, 175, 0], [255, 255, 0], [147, 184, 190], [75, 112, 221]];//i want to put some different color for every planets but it doesnt work
import {Planet} from "./planet.js"
export class SolarSystem{
    constructor(Xsun, Ysun) {
        this.Xsun = Xsun;
        this.Ysun = Ysun;
        this.planets = this.generate();
        this.sun = new Planet(this.Xsun,this.Ysun,0,0,100,0,0,0,0,[255,140,0]);
        

        
    }


    generate()// this function creates a list of the 9 planets that turns around the sun
    {
        let planets_rep = [];
        let anneau = random([0, 1]); //this is to put some ellipse randomly around some of the 9 planets 
    for (let i = 1; i < 9; i++){
        let xplanet = i*25;// this is a ratio to put every planets a little bit further from the sun 
        let yplanet = 0;
        //console.log(xplanet, yplanet);
        let radiusw = 100 + (i-1) * 50;//radius of the ellipse on wich the planets turns on
        let radiush = 25 + (i-1) * 12;
        let velocity = 0.01 - (i-1) * 0.001;
        let r = random(10, 40);
        let color = [tabColor[i-1][0],tabColor[i-1][1],tabColor[i-1][2]];
        let planet = new Planet(0, 0, xplanet, yplanet, r, radiusw, radiush, velocity, 0, color, anneau);
      planets_rep.push(planet);
    }
    return planets_rep;
    }

    display(sketch) {//function that shows and moves every planets of the list
        sketch.push();
        sketch.translate(this.Xsun, this.Ysun);
        sketch.rotate(PI / -12);
        this.sun.showSun(sketch);
        for (let i = 0; i < this.planets.length; i++){
            if (i == 2 || i == 4 || i == 6) {//to put some ellipse "randomly" around some of the 9 planets 
                this.planets[i].showAnneau(sketch);
            }
            this.planets[i].show(sketch);
            this.planets[i].move(sketch);
        }
        
        sketch.pop();
    }

   
    

    



}