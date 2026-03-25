export class Cue {
    constructor()
    {
        this.a1  = 0
        this.a2  = 0
        this.b1  = 1920
        this.b2  = 1080
        this.detected = false
    }

    show(sketch) {
        if (!this.detected) return;

        sketch.push();
        sketch.strokeCap(sketch.ROUND);

        // Soft halo to make cue detection easy to read on any background.
        sketch.stroke(255, 220, 0, 100);
        sketch.strokeWeight(16);
        sketch.line(this.a1, this.a2, this.b1, this.b2);

        // Main witness line.
        sketch.stroke(255, 235, 50);
        sketch.strokeWeight(7);
        sketch.line(this.a1, this.a2, this.b1, this.b2);

        // Endpoints marker.
        sketch.noStroke();
        sketch.fill(255, 245, 120);
        sketch.circle(this.a1, this.a2, 16);
        sketch.circle(this.b1, this.b2, 16);
        sketch.pop();
    }

    update_data(data) {
        if (data == undefined)  return;
        this.data = data;
    }
    
    update(){
        if (this.data == undefined) return;
        this.detected = this.data[0] === true;
        if (!this.detected) return;
        this.a1 = this.data[1][0]
        this.a2 = this.data[1][1]
        this.b1 = this.data[2][0]
        this.b2 = this.data[2][1]
    }
}