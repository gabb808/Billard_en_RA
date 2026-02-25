let galaxie;
let circles = [];
let solarsystemMouse;
let tabColor = [[128, 128, 128], [250, 240, 180], [0, 127, 255], [178, 46, 32], [255, 175, 0], [255, 255, 0], [147, 184, 190], [75, 112, 221]];//i want to put some different color for every planets but it doesnt work
let bubbles = [];
let SolSyst = [];

function setup() {
  createCanvas(800,600);
  slider = createSlider(0.25, 2, 0.1,0.2);
  slider.position(10, 10);
  slider.style('width', '80px');
  galaxie = new Galaxy(4000);
 
  //sun = new Planet(0,0,100,0,0,0,0,[255,140,0]);
  //mercure = new Planet(50,0,10,100,25,0.02,0,[128, 128, 128]);
  //venus = new Planet(75,0,20,150,37,0.009,0,[250, 240, 180]);
  //earth = new Planet(100,0,30,200,50,0.007,0,[0, 127, 255]);
  //mars = new Planet(125,0,15,250,62,0.005,0,[178,46,32]);
  //jupiter = new Planet(150,0,45,300,75,0.003,0,[255,175,0]);
  //saturne = new Planet(175,0,40,350,87,0.001,0,[255,255,0]);
  //uranus = new Planet(200,0,28,400,100,0.0008,0,[147, 184, 190]);
  //neptune = new Planet(225,0,35,450,112,0.0006,0,[75,112,221]);
  
  for (let i = 0; i < 2000; i++){
    let x = random(width);
    let y = random(height);
    let dot = new Dot(x,y);
    circles.push(dot);
  }

  for (let i = 0; i < 3; i++){
    let x = random(width);
    let y = random(height);
    let bubble = new Bubble(x,y);
    bubbles.push(bubble);
  }

  for (let bubble of bubbles){
  let solsyst = new SolarSystem(bubble.x, bubble.y);
  SolSyst.push(solsyst);
  }

}


function draw() {
  background(0);
  for(let dot of circles){
    dot.show();
  }
   
  
  noFill();
  stroke(255);
  galaxie.moveGalaxy();



  for (let solsyst of SolSyst) {
    solsyst.display();
  }

  if (solarsystemMouse) {
    solarsystemMouse.display();
  }
      
}

function mouseDragged() {
  solarsystemMouse = new SolarSystem(mouseX, mouseY);
}
