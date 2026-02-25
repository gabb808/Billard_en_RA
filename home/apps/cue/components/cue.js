export class Cue {
    constructor()
    {
        this.a1  = 0
        this.a2  = 0
        this.b1  = 1920
        this.b2  = 1080
    }

    show(sketch) {
        sketch.show = () => {
            sketch.clear();
            sketch.stroke(255)
            sketch.strokeWeight(10)
            sketch.line(this.a1, this.a2, this.b1, this.b2)
        }
    }

    update_data(data) {
        if (data == undefined)  return;
        this.data = data;
    }
    
    update(){
        if (this.data == undefined) return;
        if (this.data[0] == false) return;
        this.a1 = this.data[1][0]
        this.a2 = this.data[1][1]
        this.b1 = this.data[2][0]
        this.b2 = this.data[2][1]
    }
}