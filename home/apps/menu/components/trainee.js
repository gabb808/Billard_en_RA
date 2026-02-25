

let mouse_trail = [];

function setup() {
  createCanvas(500, 500);
  noStroke();
}

function draw() {
  background(50);

  // Add a point to the end of the trail at the mouse position
  mouse_trail.push(new p5.Vector(mouseX, mouseY));

  // If the trail gets too long, remove the first (oldest) point
  if (mouse_trail.length > 30) {
    mouse_trail.shift();
  }

  // Draw the trail
  for (let i = 0; i < mouse_trail.length; i++) {
    let p = mouse_trail[i];

    // The trail is smaller at the beginning,
    // and larger closer to the mouse
    let size = 40.0 * i / mouse_trail.length;
    circle(p.x, p.y, size);
  }
}

