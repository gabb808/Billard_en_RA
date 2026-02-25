//fonctions à modifier this.a par this.triangle[i] where i = 0 pour a, 1 pour b, 2 pour c
//calculateAngle
//returnXcenter //ok normalement
//returnYcenter //ok normalement
// calculatePerpendicularBisector //ok normalement

export class Triangle {
    constructor(a,b,c,color=255)
    {
        this.triangle=[a,b,c] //a, b, c from class Ball
        this.angle_a = this.calculateAngle(2,0,1);
        this.angle_b = this.calculateAngle(0,1,2);
        this.angle_c = this.calculateAngle(1,2,0);
        this.x = (this.triangle[0].x+this.triangle[1].x+this.triangle[2].x)/3; //Gravity Center X (or centroid x)
        this.y = (this.triangle[0].y+this.triangle[1].y+this.triangle[2].y)/3; //Gravity Center Y (or centroid y)
        this.color = this.IsRightTriangle() ? [0,170,255] : color;

        //FOR PERPENDICULAR BIJECTOR
        this.middle1 = createVector(this.returnXCenter(0,1), this.returnYCenter(0,1))
        this.extremity1_1 = this.calculatePerpendicularBisector(this.middle1,1)
        this.extremity1_2 = createVector(this.middle1.x-(this.extremity1_1.x-this.middle1.x),this.middle1.y-(this.extremity1_1.y-this.middle1.y))

        this.middle2 = createVector(this.returnXCenter(1,2), this.returnYCenter(1,2))
        this.extremity2_1 = this.calculatePerpendicularBisector(this.middle2,2)
        this.extremity2_2 = createVector(this.middle2.x-(this.extremity2_1.x-this.middle2.x),this.middle2.y-(this.extremity2_1.y-this.middle2.y))

        this.middle3 = createVector(this.returnXCenter(2,0), this.returnYCenter(2,0))
        this.extremity3_1 = this.calculatePerpendicularBisector(this.middle3,0)
        this.extremity3_2 = createVector(this.middle3.x-(this.extremity3_1.x-this.middle3.x),this.middle3.y-(this.extremity3_1.y-this.middle3.y))

        this.circumcenter = this.intersect_point(this.extremity1_1,this.extremity1_2,this.extremity2_1,this.extremity2_2)

    }

    updateTriangleInfos(color = 255) {
        this.angle_a = this.calculateAngle(2,0,1);
        this.angle_b = this.calculateAngle(0,1,2);
        this.angle_c = this.calculateAngle(1,2,0);
        this.x = (this.triangle[0].x+this.triangle[1].x+this.triangle[2].x)/3; //Gravity Center X (or centroid x)
        this.y = (this.triangle[0].y+this.triangle[1].y+this.triangle[2].y)/3; //Gravity Center Y (or centroid y)
        this.color = this.IsRightTriangle() ? [0,170,255] : color;

        //FOR PERPENDICULAR BIJECTOR
        this.middle1 = createVector(this.returnXCenter(0,1), this.returnYCenter(0,1))
        this.extremity1_1 = this.calculatePerpendicularBisector(this.middle1,1)
        this.extremity1_2 = createVector(this.middle1.x-(this.extremity1_1.x-this.middle1.x),this.middle1.y-(this.extremity1_1.y-this.middle1.y))

        this.middle2 = createVector(this.returnXCenter(1,2), this.returnYCenter(1,2))
        this.extremity2_1 = this.calculatePerpendicularBisector(this.middle2,2)
        this.extremity2_2 = createVector(this.middle2.x-(this.extremity2_1.x-this.middle2.x),this.middle2.y-(this.extremity2_1.y-this.middle2.y))

        this.middle3 = createVector(this.returnXCenter(2,0), this.returnYCenter(2,0))
        this.extremity3_1 = this.calculatePerpendicularBisector(this.middle3,0)
        this.extremity3_2 = createVector(this.middle3.x-(this.extremity3_1.x-this.middle3.x),this.middle3.y-(this.extremity3_1.y-this.middle3.y))

        this.circumcenter = this.intersect_point(this.extremity1_1,this.extremity1_2,this.extremity2_1,this.extremity2_2)
    }

    IsRightTriangle() {
        if((this.angle_a==90) || (this.angle_b==90) || (this.angle_c==90)) {
            return true;
        }
        return false;
    }

    changeColor(rgb) {
        this.color = rgb; //example : (255,141,92) or 255 for gray shades
    }

    show(sketch) {
        sketch.push();
        sketch.stroke(this.color)
        sketch.strokeWeight(5)
        sketch.line(this.triangle[0].x,this.triangle[0].y,this.triangle[1].x,this.triangle[1].y)
        sketch.line(this.triangle[0].x,this.triangle[0].y,this.triangle[2].x,this.triangle[2].y)
        sketch.line(this.triangle[2].x,this.triangle[2].y,this.triangle[1].x,this.triangle[1].y)
        sketch.pop();
    }

    showAngle(sketch,f){
        sketch.textFont(f, 48);
        // textSize(48);
        sketch.noStroke();
        sketch.fill(255);
        let distance = 60;
        let angle_text = 180
        sketch.textAlign(CENTER, CENTER);

        sketch.push();
        sketch.translate(
            (this.triangle[0].x<this.x) ? this.triangle[0].x-distance : this.triangle[0].x +distance,
            (this.triangle[0].y<this.y) ? this.triangle[0].y-distance : this.triangle[0].y +distance
        );
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate( radians(angle_text) );
        sketch.text(this.angle_a+"°", 0,0);
        sketch.pop();

        sketch.push();
        sketch.translate(
            (this.triangle[1].x<this.x) ? this.triangle[1].x-distance : this.triangle[1].x +distance,
            (this.triangle[1].y<this.y) ? this.triangle[1].y-distance : this.triangle[1].y +distance
        );
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate( radians(angle_text) );
        sketch.text(this.angle_b+"°", 0,0);
        sketch.pop();

        sketch.push();
        sketch.translate(
            (this.triangle[2].x<this.x) ? this.triangle[2].x-distance : this.triangle[2].x +distance,
            (this.triangle[2].y<this.y) ? this.triangle[2].y-distance : this.triangle[2].y +distance
        );
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate( radians(angle_text) );
        sketch.text(this.angle_c+"°", 0,0);
        sketch.pop();
    }

    distanceOf2Balls(p1,p2){
        return round(dist(p1.x,p1.y,p2.x,p2.y),5)
    }

    calculateAngle(p1,p2,p3) {
        // console.log(this.triangle[p1])
        let AB = this.distanceOf2Balls(this.triangle[p1],this.triangle[p2]);
        let BC = this.distanceOf2Balls(this.triangle[p2],this.triangle[p3]);
        let AC = this.distanceOf2Balls(this.triangle[p1],this.triangle[p3]);
        return round(acos((BC**2 + AB**2 - AC**2)/(2*BC*AB)) * 180 / PI)
    }

    calculatePerpendicularBisector(i,p1) {
        let u = createVector(this.triangle[p1].x-i.x,this.triangle[p1].y-i.y)
        let v = createVector(-u.y,u.x)
        return createVector(v.x+i.x,v.y+i.y)
        // let v = createVector(p2.x-p3.x,p2.y-2*p3.y)
        // let w = u.cross(v)
        // v = u.cross(w)
    }

    intersect_point(point1, point2, point3, point4) {
        let ua = ((point4.x - point3.x) * (point1.y - point3.y) -
                  (point4.y - point3.y) * (point1.x - point3.x)) /
                 ((point4.y - point3.y) * (point2.x - point1.x) -
                  (point4.x - point3.x) * (point2.y - point1.y));

       let ub = ((point2.x - point1.x) * (point1.y - point3.y) -
                  (point2.y - point1.y) * (point1.x - point3.x)) /
                 ((point4.y - point3.y) * (point2.x - point1.x) -
                  (point4.x - point3.x) * (point2.y - point1.y));

       let x = point1.x + ua * (point2.x - point1.x);
       let y = point1.y + ua * (point2.y - point1.y);

       return createVector(x, y)
    }

    returnXCenter(p1,p2) {
        // console.log(this.triangle[p1].x)
        return int((this.triangle[p1].x+this.triangle[p2].x)/2)
    }

    returnYCenter(p1,p2) {
        return int((this.triangle[p1].y+this.triangle[p2].y)/2)
    }


    showCentroid(sketch) {
      sketch.push();
      sketch.strokeWeight(5)
      sketch.fill(255,255,0);
      sketch.circle(this.x,this.y,15);
      sketch.pop();
    }

    showMediane(sketch) {
        sketch.push();
        sketch.stroke(255,255,0)
        sketch.strokeWeight(5)
        sketch.line(this.triangle[0].x,this.triangle[0].y,this.returnXCenter(1,2),this.returnYCenter(1, 2))
        sketch.line(this.triangle[1].x,this.triangle[1].y,this.returnXCenter(0,2),this.returnYCenter(0, 2))
        sketch.line(this.triangle[2].x,this.triangle[2].y,this.returnXCenter(1,0),this.returnYCenter(1, 0))
        sketch.pop();
    }

    showPerpendicularBisector(sketch) {
        sketch.push();
        sketch.strokeWeight(5)
        sketch.fill(255,0,255);
        sketch.circle(this.circumcenter.x,this.circumcenter.y,15);
        sketch.noFill();
        sketch.stroke(255,0,255)
        sketch.line(this.extremity1_1.x,this.extremity1_1.y, this.extremity1_2.x,this.extremity1_2.y)
        sketch.line(this.extremity2_1.x,this.extremity2_1.y, this.extremity2_2.x,this.extremity2_2.y)
        sketch.line(this.extremity3_1.x,this.extremity3_1.y, this.extremity3_2.x,this.extremity3_2.y)
        sketch.pop();
    }

    showCircumCircle(sketch) {
      sketch.push();
      sketch.stroke(255,0,255)
      sketch.strokeWeight(8)
      sketch.fill(0)
      sketch.noFill();
      sketch.circle(this.circumcenter.x,this.circumcenter.y,(this.distanceOf2Balls(this.circumcenter,this.triangle[0]))*2)
      sketch.pop();
    }
}
