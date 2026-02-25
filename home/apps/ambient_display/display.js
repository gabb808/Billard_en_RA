import { Dot } from "./components/dot.js"
import { Fireworks } from "./components/fireworks.js"

export const ambient_display = new p5(sketch => {
    sketch.name = "ambient_display";
    sketch.activated = false;

    let firework;
    let fireworks = [];
    let dots = [];
    let dist = [];
    let flagfire = true;
    let flagdistmin = true;
    let flagtempofire = false;
    let chronofire = 0;
    let chronomax = 3000;
    let countfire = 0;
    let countmax = 6;


    sketch.preload = () => {
        //sable = loadImage('./platform/home/apps/sandtable/components/sable.jpg');
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch.createCanvas(width, height, sketch.WEBGL).position(0, 0);

        //open the driver to retrieve the data
        //socket.on("mouvements", (data) => (dict = data));
        socket.on(sketch.name, data => sketch.update_data(data));
        sketch.activated = true;

        for(var i=0; i<50; i++){
           let dot = new Dot();
           dots.push(dot);
        }
    };


    sketch.resume = () => { };
    sketch.pause = () => { };
    sketch.update = () => { };

    // receprer les valeurs du dictionnaie data afin de n'avoir que des distances
    sketch.update_data = (data) => {
        if (data == undefined) return;
        if (Object.keys(data).length > 0) {
            dist = Object.values(data);
        }
    };

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        sketch.fill(255);
        sketch.push();
        sketch.push();
        sketch.pop();

        background(0);

        for(let dot of dots){
            dot.updateDot();
            dot.showDot(sketch);
            console.log(dot.getPos());
        }
      
        let min = 50; 
        
        for(let i = 0; i < dist.length; i++) {
            if(dist[i]>min){
                firework = undefined;
            }
            else{
                if(flagfire == true){

                    if (firework == undefined){
                        firework = new Fireworks(random(width),random(height));
                        if (flagtempofire == false){
                            chronofire = millis();
                            flagtempofire = true;//maintenir le feu dartifice pdt le delai tempo
                        }
                    }
                    //pour limiter la taille de la liste à countmax
                    if(flagtempofire == true){
                        countfire++;
                        if (countfire < countmax) {
                            fireworks.push(firework);
                        }
                        for(let j=0; j<fireworks.length; j++){
                            fireworks[j].showFirework(sketch);
                            
                        }
                    }
                    
                }
            } 
        }
        
        // on arrête de tirer au delà de la temporisation
        if(flagtempofire == true && ((millis()-chronofire) > chronomax)){
            flagfire = false;//on repasse l'affichage du firework à false
            flagtempofire = false;//on reeinitialise le temps de feu à 0
        }
        //on determine si on pourra denouveau declencher un frwork
        if(flagfire == false)//quand ya plus de feux on regarde les ditances
        {
            flagdistmin = true;
            for (let i = 0; i < dist.length; i++){
                if(dist[i]<min){
                    flagdistmin = false;//alerte : on va redemarrer un feu
                }
            }
            // si une distance est en dessous de 5, on redéclenche frwork
            if(flagdistmin == false){
                firework = undefined;
                fireworks = [];
                flagfire = true; //on a le droit d'en relancer
                countfire = 0;
            }
        }
        sketch.pop();
    }

    
});


