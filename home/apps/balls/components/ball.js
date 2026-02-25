export class Ball {
    constructor(x,y,r=80,color=255)
    {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;

    }

    intersects(other) {
        let d = dist(this.x, this.y, other.x, other.y);
        return d < this.r + other.r;
    }

    changeColor(rgb) {
        this.color = rgb; //example : (255,141,92) or 255 for gray shades
    }

    contains(px, py) {
      let d = dist(px, py, this.x, this.y);
      if (d < this.r) {
        return true;
      } else {
        return false;
      }
    }

  //   update_data(data) {
  //     if (data != undefined) {
  //         for (let b of data){
  //             this.x = b[0]
  //             this.y = b[1]
  //         }
  //     }
  // }

    show(sketch) {
      // sketch.push();
      sketch.stroke(255)
      sketch.strokeWeight(8)
      sketch.noFill()
      // sketch.fill(0)

      //TEST
      // circle(0,0, this.r)
      // circle(1920,0, this.r)
      // circle(0,1080, this.r)
      // circle(1920,1080, this.r)
      // circle(960,540, this.r)
      sketch.circle(this.x,this.y,this.r)
      // sketch.pop();
    }
}
