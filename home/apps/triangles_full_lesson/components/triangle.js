//fonctions à modifier this.a par this.triangle[i] where i = 0 pour a, 1 pour b, 2 pour c
//calculateAngle
//returnXcenter //ok normalement
//returnYcenter //ok normalement
// calculatePerpendicularBisector //ok normalement

export class Triangle {
    constructor(a, b, c, color = 255) {
        this.triangle = [a, b, c] //a, b, c from class Ball
        this.angle_a = this.calculateAngle(2, 0, 1);
        this.angle_b = this.calculateAngle(0, 1, 2);
        this.angle_c = this.calculateAngle(1, 2, 0);
        this.x = (this.triangle[0].x + this.triangle[1].x + this.triangle[2].x) / 3; //Gravity Center X (or centroid x)
        this.y = (this.triangle[0].y + this.triangle[1].y + this.triangle[2].y) / 3; //Gravity Center Y (or centroid y)
        this.color = this.IsRightTriangle() ? [0, 170, 255] : color;

        //FOR PERPENDICULAR BIJECTOR
        this.middle1 = createVector(this.returnXCenter(0, 1), this.returnYCenter(0, 1))
        this.extremity1_1 = this.calculatePerpendicularBisector(this.middle1, 1)
        this.extremity1_2 = createVector(this.middle1.x - (this.extremity1_1.x - this.middle1.x), this.middle1.y - (this.extremity1_1.y - this.middle1.y))

        this.middle2 = createVector(this.returnXCenter(1, 2), this.returnYCenter(1, 2))
        this.extremity2_1 = this.calculatePerpendicularBisector(this.middle2, 2)
        this.extremity2_2 = createVector(this.middle2.x - (this.extremity2_1.x - this.middle2.x), this.middle2.y - (this.extremity2_1.y - this.middle2.y))

        this.middle3 = createVector(this.returnXCenter(2, 0), this.returnYCenter(2, 0))
        this.extremity3_1 = this.calculatePerpendicularBisector(this.middle3, 0)
        this.extremity3_2 = createVector(this.middle3.x - (this.extremity3_1.x - this.middle3.x), this.middle3.y - (this.extremity3_1.y - this.middle3.y))

        this.circumcenter = this.intersectPoint(this.extremity1_1, this.extremity1_2, this.extremity2_1, this.extremity2_2)

        this.calculateRightSymbols()
        this.calculateEqualSymbols()

        //FOR ALTITUDES
        this.k = 0.1
        this.computeAltitudesCoordonates()
        this.computeAltitudesEqualSymbols()
    }

    updateTriangleInfos(color = 255) {
        this.angle_a = this.calculateAngle(2, 0, 1);
        this.angle_b = this.calculateAngle(0, 1, 2);
        this.angle_c = this.calculateAngle(1, 2, 0);
        this.x = (this.triangle[0].x + this.triangle[1].x + this.triangle[2].x) / 3; //Gravity Center X (or centroid x)
        this.y = (this.triangle[0].y + this.triangle[1].y + this.triangle[2].y) / 3; //Gravity Center Y (or centroid y)
        this.color = this.IsRightTriangle() ? [0, 170, 255] : color;

        //FOR PERPENDICULAR BIJECTOR
        this.middle1 = createVector(this.returnXCenter(0, 1), this.returnYCenter(0, 1))
        this.extremity1_1 = this.calculatePerpendicularBisector(this.middle1, 1)
        this.extremity1_2 = createVector(this.middle1.x - (this.extremity1_1.x - this.middle1.x), this.middle1.y - (this.extremity1_1.y - this.middle1.y))

        this.middle2 = createVector(this.returnXCenter(1, 2), this.returnYCenter(1, 2))
        this.extremity2_1 = this.calculatePerpendicularBisector(this.middle2, 2)
        this.extremity2_2 = createVector(this.middle2.x - (this.extremity2_1.x - this.middle2.x), this.middle2.y - (this.extremity2_1.y - this.middle2.y))

        this.middle3 = createVector(this.returnXCenter(2, 0), this.returnYCenter(2, 0))
        this.extremity3_1 = this.calculatePerpendicularBisector(this.middle3, 0)
        this.extremity3_2 = createVector(this.middle3.x - (this.extremity3_1.x - this.middle3.x), this.middle3.y - (this.extremity3_1.y - this.middle3.y))

        this.circumcenter = this.intersectPoint(this.extremity1_1, this.extremity1_2, this.extremity2_1, this.extremity2_2)

        this.calculateEqualSymbols()
        this.calculateRightSymbols()
    }

    IsRightTriangle() {
        if ((this.angle_a == 90) || (this.angle_b == 90) || (this.angle_c == 90)) {
            return true;
        }
        return false;
    }

    IsIsoceleTriangle(tolerance = 2) { //tolerance is in degrees
        if (abs(this.angle_a - this.angle_b) < tolerance || abs(this.angle_b - this.angle_c) < tolerance || abs(this.angle_c - this.angle_a) < tolerance) {
            return true;
        }
        return false;
    }

    IsEquilateralTriangle(tolerance = 2) { //tolerance is in degrees
        if (abs(this.angle_a - this.angle_b) < tolerance && abs(this.angle_b - this.angle_c) < tolerance) {
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
        sketch.line(this.triangle[0].x, this.triangle[0].y, this.triangle[1].x, this.triangle[1].y)
        sketch.line(this.triangle[0].x, this.triangle[0].y, this.triangle[2].x, this.triangle[2].y)
        sketch.line(this.triangle[2].x, this.triangle[2].y, this.triangle[1].x, this.triangle[1].y)
        sketch.pop();
    }

    showAngle(sketch, f, reverse = false) {
        sketch.textFont(f, 48);
        // textSize(48);
        sketch.noStroke();
        sketch.fill(255);
        let distance = 60;
        let angle_text = 180
        if (reverse) {
            angle_text = 0
        }
        sketch.textAlign(CENTER, CENTER);

        sketch.push();
        sketch.translate(
            (this.triangle[0].x < this.x) ? this.triangle[0].x - distance : this.triangle[0].x + distance,
            (this.triangle[0].y < this.y) ? this.triangle[0].y - distance : this.triangle[0].y + distance
        );
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate(radians(angle_text));
        sketch.text(this.angle_a + "°", 0, 0);
        sketch.pop();

        sketch.push();
        sketch.translate(
            (this.triangle[1].x < this.x) ? this.triangle[1].x - distance : this.triangle[1].x + distance,
            (this.triangle[1].y < this.y) ? this.triangle[1].y - distance : this.triangle[1].y + distance
        );
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate(radians(angle_text));
        sketch.text(this.angle_b + "°", 0, 0);
        sketch.pop();

        sketch.push();
        sketch.translate(
            (this.triangle[2].x < this.x) ? this.triangle[2].x - distance : this.triangle[2].x + distance,
            (this.triangle[2].y < this.y) ? this.triangle[2].y - distance : this.triangle[2].y + distance
        );
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate(radians(angle_text));
        sketch.text(this.angle_c + "°", 0, 0);
        sketch.pop();
    }

    distanceOf2Balls(p1, p2) {
        return round(dist(p1.x, p1.y, p2.x, p2.y), 5)
    }

    calculateAngle(p1, p2, p3) {
        let AB = this.distanceOf2Balls(this.triangle[p1], this.triangle[p2]);
        let BC = this.distanceOf2Balls(this.triangle[p2], this.triangle[p3]);
        let AC = this.distanceOf2Balls(this.triangle[p1], this.triangle[p3]);
        return round(acos((BC ** 2 + AB ** 2 - AC ** 2) / (2 * BC * AB)) * 180 / PI)
    }

    calculatePerpendicularBisector(i, p1) {
        let u = createVector(this.triangle[p1].x - i.x, this.triangle[p1].y - i.y)
        let v = createVector(-u.y, u.x)
        return createVector(v.x + i.x, v.y + i.y)
        // let v = createVector(p2.x-p3.x,p2.y-2*p3.y)
        // let w = u.cross(v)
        // v = u.cross(w)
    }

    calculatePerpendicularBisector2(i, j) {
        let u = createVector(j.x - i.x, j.y - i.y)
        let v = createVector(-u.y, u.x)
        return createVector(v.x + i.x, v.y + i.y)
    }

    calculateEqualSymbols() {

        //COMPUTE | coordinnates between this.triangle[0] and this.triangle[2] (middle3)
        let D1 = createVector((this.triangle[0].x + this.middle3.x) / 2, (this.triangle[0].y + this.middle3.y) / 2)
        let D2 = createVector((this.triangle[2].x + this.middle3.x) / 2, (this.triangle[2].y + this.middle3.y) / 2)

        let extremityD1_1 = this.calculatePerpendicularBisector(D1, 0)
        let extremityD1_2 = createVector(D1.x - (extremityD1_1.x - D1.x), D1.y - (extremityD1_1.y - D1.y))

        let extremityD2_1 = this.calculatePerpendicularBisector(D2, 2)
        let extremityD2_2 = createVector(D2.x - (extremityD2_1.x - D2.x), D2.y - (extremityD2_1.y - D2.y))

        this.M1 = createVector(D1.x + this.k * (extremityD1_1.x - D1.x), D1.y + this.k * (extremityD1_1.y - D1.y))
        this.M2 = createVector(D1.x + this.k * (extremityD1_2.x - D1.x), D1.y + this.k * (extremityD1_2.y - D1.y))

        this.N1 = createVector(D2.x + this.k * (extremityD2_1.x - D2.x), D2.y + this.k * (extremityD2_1.y - D2.y))
        this.N2 = createVector(D2.x + this.k * (extremityD2_2.x - D2.x), D2.y + this.k * (extremityD2_2.y - D2.y))

        //COMPUTE || coordinnates between this.triangle[0] and this.triangle[2] (middle3)

        // 1st double line
        let E1 = createVector((this.triangle[2].x + this.middle2.x) / 2, (this.triangle[2].y + this.middle2.y) / 2)

        let F1 = createVector(E1.x + this.k * (this.triangle[2].x - E1.x), E1.y + this.k * (this.triangle[2].y - E1.y))
        let G1 = createVector(E1.x - this.k * (this.triangle[2].x - E1.x), E1.y - this.k * (this.triangle[2].y - E1.y))

        let extremityF1_1 = this.calculatePerpendicularBisector(F1, 2)
        let extremityF1_2 = createVector(F1.x - (extremityF1_1.x - F1.x), F1.y - (extremityF1_1.y - F1.y))

        let extremityG1_1 = this.calculatePerpendicularBisector2(G1, this.middle2)
        let extremityG1_2 = createVector(G1.x - (extremityG1_1.x - G1.x), G1.y - (extremityG1_1.y - G1.y))

        this.H1 = createVector(F1.x + this.k * (extremityF1_1.x - F1.x), F1.y + this.k * (extremityF1_1.y - F1.y))
        this.H2 = createVector(F1.x + this.k * (extremityF1_2.x - F1.x), F1.y + this.k * (extremityF1_2.y - F1.y))

        this.I1 = createVector(G1.x + this.k * (extremityG1_1.x - G1.x), G1.y + this.k * (extremityG1_1.y - G1.y))
        this.I2 = createVector(G1.x + this.k * (extremityG1_2.x - G1.x), G1.y + this.k * (extremityG1_2.y - G1.y))

        // 2nd double line
        let E2 = createVector((this.triangle[1].x + this.middle2.x) / 2, (this.triangle[1].y + this.middle2.y) / 2)

        let F2 = createVector(E2.x + this.k * (this.triangle[1].x - E2.x), E2.y + this.k * (this.triangle[1].y - E2.y))
        let G2 = createVector(E2.x - this.k * (this.triangle[1].x - E2.x), E2.y - this.k * (this.triangle[1].y - E2.y))

        let extremityF2_1 = this.calculatePerpendicularBisector(F2, 1)
        let extremityF2_2 = createVector(F2.x - (extremityF2_1.x - F2.x), F2.y - (extremityF2_1.y - F2.y))

        let extremityG2_1 = this.calculatePerpendicularBisector2(G2, this.middle2)
        let extremityG2_2 = createVector(G2.x - (extremityG2_1.x - G2.x), G2.y - (extremityG2_1.y - G2.y))

        this.J1 = createVector(F2.x + this.k * (extremityF2_1.x - F2.x), F2.y + this.k * (extremityF2_1.y - F2.y))
        this.J2 = createVector(F2.x + this.k * (extremityF2_2.x - F2.x), F2.y + this.k * (extremityF2_2.y - F2.y))

        this.K1 = createVector(G2.x + this.k * (extremityG2_1.x - G2.x), G2.y + this.k * (extremityG2_1.y - G2.y))
        this.K2 = createVector(G2.x + this.k * (extremityG2_2.x - G2.x), G2.y + this.k * (extremityG2_2.y - G2.y))
    }

    showLetter(sketch, f) {
        sketch.textFont(f, 48);
        // textSize(48);
        sketch.noStroke();
        sketch.fill(255);
        let distance = 28;
        let angle_text = 180
        sketch.textAlign(CENTER, CENTER);

        sketch.push();
        sketch.translate(
            (this.triangle[0].x < this.x) ? this.triangle[0].x - distance : this.triangle[0].x + distance,
            (this.triangle[0].y < this.y) ? this.triangle[0].y - distance : this.triangle[0].y + distance
        );
        sketch.rotate(radians(angle_text));
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate(radians(angle_text));
        sketch.text("A", 0, 0);
        sketch.pop();

        sketch.push();
        sketch.translate(
            (this.triangle[1].x < this.x) ? this.triangle[1].x - distance : this.triangle[1].x + distance,
            (this.triangle[1].y < this.y) ? this.triangle[1].y - distance : this.triangle[1].y + distance
        );
        sketch.rotate(radians(angle_text));
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate(radians(angle_text));
        sketch.text("B", 0, 0);
        sketch.pop();

        sketch.push();
        sketch.translate(
            (this.triangle[2].x < this.x) ? this.triangle[2].x - distance : this.triangle[2].x + distance,
            (this.triangle[2].y < this.y) ? this.triangle[2].y - distance : this.triangle[2].y + distance
        );
        sketch.rotate(radians(angle_text));
        sketch.textAlign(CENTER, CENTER);
        sketch.rotate(radians(angle_text));
        sketch.text("C", 0, 0);
        sketch.pop();
    }

    calculateRightSymbols() {
        this.k = 0.07
        // let A1 = createVector(this.triangle[0].x + this.k * (this.middle1.x - this.triangle[0].x), this.triangle[0].y + this.k * (this.middle1.y - this.triangle[0].y))
        this.A1 = createVector(this.middle1.x + this.k * (this.triangle[0].x - this.middle1.x), this.middle1.y + this.k * (this.triangle[0].y - this.middle1.y))
        this.A2 = createVector(this.middle1.x + this.k * (this.extremity1_2.x - this.middle1.x), this.middle1.y + this.k * (this.extremity1_2.y - this.middle1.y))
        this.A3 = createVector(this.A2.x + (this.A1.x - this.middle1.x), this.A2.y + (this.A1.y - this.middle1.y))

        this.B1 = createVector(this.middle2.x + this.k * (this.triangle[1].x - this.middle2.x), this.middle2.y + this.k * (this.triangle[1].y - this.middle2.y))
        this.B2 = createVector(this.middle2.x + this.k * (this.extremity2_2.x - this.middle2.x), this.middle2.y + this.k * (this.extremity2_2.y - this.middle2.y))
        this.B3 = createVector(this.B2.x + (this.B1.x - this.middle2.x), this.B2.y + (this.B1.y - this.middle2.y))

        this.C1 = createVector(this.middle3.x + this.k * (this.triangle[2].x - this.middle3.x), this.middle3.y + this.k * (this.triangle[2].y - this.middle3.y))
        this.C2 = createVector(this.middle3.x + this.k * (this.extremity3_2.x - this.middle3.x), this.middle3.y + this.k * (this.extremity3_2.y - this.middle3.y))
        this.C3 = createVector(this.C2.x + (this.C1.x - this.middle3.x), this.C2.y + (this.C1.y - this.middle3.y))
        this.k = 0.1
    }

    showRightSymbols(sketch) {
        this.showRightSymbolsAB(sketch)
        this.showRightSymbolsBC(sketch)
        this.showRightSymbolsAC(sketch)
    }
    showRightSymbolsAB(sketch) {
        sketch.stroke(255, 0, 255)
        sketch.fill(0, 0, 255)
        sketch.strokeWeight(5)
        sketch.line(this.A2.x, this.A2.y, this.A3.x, this.A3.y)
        sketch.line(this.A3.x, this.A3.y, this.A1.x, this.A1.y)
    }
    showRightSymbolsBC(sketch) {
        sketch.stroke(255, 0, 255)
        sketch.fill(0, 0, 255)
        sketch.strokeWeight(5)
        sketch.line(this.B2.x, this.B2.y, this.B3.x, this.B3.y)
        sketch.line(this.B3.x, this.B3.y, this.B1.x, this.B1.y)
    }
    showRightSymbolsAC(sketch) {
        sketch.stroke(255, 0, 255)
        sketch.fill(0, 0, 255)
        sketch.strokeWeight(5)
        sketch.line(this.C2.x, this.C2.y, this.C3.x, this.C3.y)
        sketch.line(this.C3.x, this.C3.y, this.C1.x, this.C1.y)
    }

    showAllMediatrice(sketch) {
        this.showAllMediatriceAB(sketch)
        this.showAllMediatriceBC(sketch)
        this.showAllMediatriceAC(sketch)
    }
    showAllMediatriceAB(sketch) {
        this.showPerpendicularBisectorAB(sketch)
        this.showEqualSymbolsAB(sketch)
        this.showRightSymbolsAB(sketch)
    }
    showAllMediatriceBC(sketch) {
        this.showPerpendicularBisectorBC(sketch)
        this.showEqualSymbolsBC(sketch)
        this.showRightSymbolsBC(sketch)
    }
    showAllMediatriceAC(sketch) {
        this.showPerpendicularBisectorAC(sketch)
        this.showEqualSymbolsAC(sketch)
        this.showRightSymbolsAC(sketch)
    }

    intersectPoint(point1, point2, point3, point4) {
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

    returnXCenter(p1, p2) {
        return int((this.triangle[p1].x + this.triangle[p2].x) / 2)
    }

    returnYCenter(p1, p2) {
        return int((this.triangle[p1].y + this.triangle[p2].y) / 2)
    }

    showCentroid(sketch) {
        sketch.push();
        sketch.strokeWeight(5)
        sketch.fill(255, 255, 0);
        sketch.circle(this.x, this.y, 15);
        sketch.pop();
    }

    showMediane(sketch) {
        sketch.push();
        sketch.stroke(255, 255, 0)
        sketch.strokeWeight(5)
        sketch.line(this.triangle[0].x, this.triangle[0].y, this.returnXCenter(1, 2), this.returnYCenter(1, 2))
        sketch.line(this.triangle[1].x, this.triangle[1].y, this.returnXCenter(0, 2), this.returnYCenter(0, 2))
        sketch.line(this.triangle[2].x, this.triangle[2].y, this.returnXCenter(1, 0), this.returnYCenter(1, 0))
        sketch.pop();
    }

    showPerpendicularBisector(sketch) {
        this.showPerpendicularBisectorAB(sketch)
        this.showPerpendicularBisectorBC(sketch)
        this.showPerpendicularBisectorAC(sketch)
    }

    showPerpendicularBisectorAB(sketch) {
        sketch.push();
        sketch.strokeWeight(5)
        sketch.stroke(255, 0, 255)
        sketch.line(this.extremity1_1.x, this.extremity1_1.y, this.extremity1_2.x, this.extremity1_2.y)
        // sketch.line(this.extremity2_1.x, this.extremity2_1.y, this.extremity2_2.x, this.extremity2_2.y)
        // sketch.line(this.extremity3_1.x, this.extremity3_1.y, this.extremity3_2.x, this.extremity3_2.y)
        sketch.pop();
    }

    showPerpendicularBisectorBC(sketch) {
        sketch.push();
        sketch.strokeWeight(5)
        sketch.stroke(255, 0, 255)
        // sketch.line(this.extremity1_1.x, this.extremity1_1.y, this.extremity1_2.x, this.extremity1_2.y)
        sketch.line(this.extremity2_1.x, this.extremity2_1.y, this.extremity2_2.x, this.extremity2_2.y)
        // sketch.line(this.extremity3_1.x, this.extremity3_1.y, this.extremity3_2.x, this.extremity3_2.y)
        sketch.pop();
    }
    showPerpendicularBisectorAC(sketch) {
        sketch.push();
        sketch.strokeWeight(5)
        sketch.stroke(255, 0, 255)
        sketch.noFill();
        // sketch.line(this.extremity1_1.x, this.extremity1_1.y, this.extremity1_2.x, this.extremity1_2.y)
        // sketch.line(this.extremity2_1.x, this.extremity2_1.y, this.extremity2_2.x, this.extremity2_2.y)
        sketch.line(this.extremity3_1.x, this.extremity3_1.y, this.extremity3_2.x, this.extremity3_2.y)
        sketch.pop();
    }

    showEqualSymbols(sketch) {
        this.showEqualSymbolsAB(sketch)
        this.showEqualSymbolsBC(sketch)
        this.showEqualSymbolsAC(sketch)
    }

    showEqualSymbolsAB(sketch) {
        sketch.push();
        sketch.stroke(255, 0, 255)
        sketch.strokeWeight(5)
        sketch.noFill()
        // Equal symbol : Circles
        sketch.circle((this.triangle[0].x + this.middle1.x) / 2, (this.triangle[0].y + this.middle1.y) / 2, 30);
        sketch.circle((this.triangle[1].x + this.middle1.x) / 2, (this.triangle[1].y + this.middle1.y) / 2, 30);
        sketch.pop();
    }

    showEqualSymbolsBC(sketch) {
        sketch.push();
        sketch.stroke(255, 0, 255)
        sketch.strokeWeight(2)
        sketch.noFill()
        // Equal symbol : Double Lines
        // sketch.line(this.H1.x, this.H1.y, this.H2.x, this.H2.y)
        // sketch.line(this.I1.x, this.I1.y, this.I2.x, this.I2.y)
        // sketch.line(this.J1.x, this.J1.y, this.J2.x, this.J2.y)
        // sketch.line(this.K1.x, this.K1.y, this.K2.x, this.K2.y)

        // Equal symbol : Double Circles
        sketch.circle((this.triangle[2].x + this.middle2.x) / 2, (this.triangle[2].y + this.middle2.y) / 2, 25);
        sketch.circle((this.triangle[1].x + this.middle2.x) / 2, (this.triangle[1].y + this.middle2.y) / 2, 25);
        sketch.circle((this.triangle[2].x + this.middle2.x) / 2, (this.triangle[2].y + this.middle2.y) / 2, 50);
        sketch.circle((this.triangle[1].x + this.middle2.x) / 2, (this.triangle[1].y + this.middle2.y) / 2, 50);

        sketch.pop();
    }

    showEqualSymbolsAC(sketch) {
        sketch.push();
        sketch.stroke(255, 0, 255)
        sketch.strokeWeight(5)
        sketch.noFill()
        // Equal symbol : Single Line
        sketch.line(this.M1.x, this.M1.y, this.M2.x, this.M2.y)
        sketch.line(this.N1.x, this.N1.y, this.N2.x, this.N2.y)
        sketch.pop();
    }

    showCircumCircle(sketch) {
        sketch.push();
        sketch.stroke(255, 0, 255)
        sketch.strokeWeight(8)
        sketch.fill(0)
        sketch.noFill();
        sketch.circle(this.circumcenter.x, this.circumcenter.y, (this.distanceOf2Balls(this.circumcenter, this.triangle[0])) * 2)
        sketch.pop();
    }

    placeMediatriceAB(balls, tolerance = 50) {
        if (balls.ball_nb >= 2) {
            let A_balls_ref = createVector(-(this.triangle[0].x - width), -(this.triangle[0].y - height))
            let B_balls_ref = createVector(-(this.triangle[1].x - width), -(this.triangle[1].y - height))
            if (Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[0].x, balls.balls[0].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[0].x, balls.balls[0].y)) < tolerance && Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[1].x, balls.balls[1].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[1].x, balls.balls[1].y)) < tolerance) {
                return true
            }
        }
        return false
    }

    placeMediatriceBC(balls, tolerance = 50) {
        if (balls.ball_nb >= 2) {
            let B_balls_ref = createVector(-(this.triangle[1].x - width), -(this.triangle[1].y - height))
            let C_balls_ref = createVector(-(this.triangle[2].x - width), -(this.triangle[2].y - height))

            if (Math.abs(dist(C_balls_ref.x, C_balls_ref.y, balls.balls[0].x, balls.balls[0].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[0].x, balls.balls[0].y)) < tolerance && Math.abs(dist(C_balls_ref.x, C_balls_ref.y, balls.balls[1].x, balls.balls[1].y) - dist(B_balls_ref.x, B_balls_ref.y, balls.balls[1].x, balls.balls[1].y)) < tolerance) {
                return true
            }
        }
        return false
    }

    placeMediatriceAC(balls, tolerance = 50) {
        if (balls.ball_nb >= 2) {
            let A_balls_ref = createVector(-(this.triangle[0].x - width), -(this.triangle[0].y - height))
            let C_balls_ref = createVector(-(this.triangle[2].x - width), -(this.triangle[2].y - height))

            if (Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[0].x, balls.balls[0].y) - dist(C_balls_ref.x, C_balls_ref.y, balls.balls[0].x, balls.balls[0].y)) < tolerance && Math.abs(dist(A_balls_ref.x, A_balls_ref.y, balls.balls[1].x, balls.balls[1].y) - dist(C_balls_ref.x, C_balls_ref.y, balls.balls[1].x, balls.balls[1].y)) < tolerance) {
                return true
            }
        }
        return false
    }

    placeAltitudeA(balls, tolerance = 40) {
        if (balls.ball_nb >= 2) {
            let A_ball_ref = createVector(-(this.triangle[0].x - width), -(this.triangle[0].y - height))
            let H_ball_ref = createVector(-(this.Hx - width), -(this.Hy - height))
            if ((Math.abs((balls.balls[0].x - H_ball_ref.x) * (A_ball_ref.y - H_ball_ref.y) - (balls.balls[0].y - H_ball_ref.y) * (A_ball_ref.x - H_ball_ref.x)) / Math.sqrt(Math.pow(A_ball_ref.x - H_ball_ref.x, 2) + Math.pow(A_ball_ref.y - H_ball_ref.y, 2))) < tolerance) {
                if ((Math.abs((balls.balls[1].x - H_ball_ref.x) * (A_ball_ref.y - H_ball_ref.y) - (balls.balls[1].y - H_ball_ref.y) * (A_ball_ref.x - H_ball_ref.x)) / Math.sqrt(Math.pow(A_ball_ref.x - H_ball_ref.x, 2) + Math.pow(A_ball_ref.y - H_ball_ref.y, 2))) < tolerance) {
                    return true
                }
            }
        }
        return false
    }
    placeAltitudeB(balls, tolerance = 40) {
        if (balls.ball_nb >= 2) {
            let B_ball_ref = createVector(-(this.triangle[1].x - width), -(this.triangle[1].y - height))
            let I_ball_ref = createVector(-(this.Ix - width), -(this.Iy - height))
            if ((Math.abs((balls.balls[0].x - I_ball_ref.x) * (B_ball_ref.y - I_ball_ref.y) - (balls.balls[0].y - I_ball_ref.y) * (B_ball_ref.x - I_ball_ref.x)) / Math.sqrt(Math.pow(B_ball_ref.x - I_ball_ref.x, 2) + Math.pow(B_ball_ref.y - I_ball_ref.y, 2))) < tolerance) {
                if ((Math.abs((balls.balls[1].x - I_ball_ref.x) * (B_ball_ref.y - I_ball_ref.y) - (balls.balls[1].y - I_ball_ref.y) * (B_ball_ref.x - I_ball_ref.x)) / Math.sqrt(Math.pow(B_ball_ref.x - I_ball_ref.x, 2) + Math.pow(B_ball_ref.y - I_ball_ref.y, 2))) < tolerance) {
                    return true
                }
            }
        }
        return false
    }
    placeAltitudeC(balls, tolerance = 40) {
        if (balls.ball_nb >= 2) {
            let C_ball_ref = createVector(-(this.triangle[2].x - width), -(this.triangle[2].y - height))
            let J_ball_ref = createVector(-(this.Jx - width), -(this.Jy - height))
            if ((Math.abs((balls.balls[0].x - J_ball_ref.x) * (C_ball_ref.y - J_ball_ref.y) - (balls.balls[0].y - J_ball_ref.y) * (C_ball_ref.x - J_ball_ref.x)) / Math.sqrt(Math.pow(C_ball_ref.x - J_ball_ref.x, 2) + Math.pow(C_ball_ref.y - J_ball_ref.y, 2))) < tolerance) {
                if ((Math.abs((balls.balls[1].x - J_ball_ref.x) * (C_ball_ref.y - J_ball_ref.y) - (balls.balls[1].y - J_ball_ref.y) * (C_ball_ref.x - J_ball_ref.x)) / Math.sqrt(Math.pow(C_ball_ref.x - J_ball_ref.x, 2) + Math.pow(C_ball_ref.y - J_ball_ref.y, 2))) < tolerance) {
                    return true
                }
            }
        }
        return false
    }

    showHelpMediatricePoint(sketch) {
        sketch.push();
        sketch.noStroke()
        sketch.fill(255, 255, 0)
        sketch.circle(this.extremity3_1.x, this.extremity3_1.y, 90);
        sketch.pop();
    }

    computeAltitudesCoordonates() {
        this.getTriangleAltitudesCoordinates()
        //Extend altitudes lines for better visualization
        this.k = 1.4 //extension coefficient
        this.Hx_prime = (this.k * (this.Hx - this.triangle[0].x)) + this.triangle[0].x
        this.Hy_prime = (this.k * (this.Hy - this.triangle[0].y)) + this.triangle[0].y
        this.Ax_prime = (this.k * (this.triangle[0].x - this.Hx)) + this.Hx
        this.Ay_prime = (this.k * (this.triangle[0].y - this.Hy)) + this.Hy

        this.Ix_prime = (this.k * (this.Ix - this.triangle[1].x)) + this.triangle[1].x
        this.Iy_prime = (this.k * (this.Iy - this.triangle[1].y)) + this.triangle[1].y
        this.Bx_prime = (this.k * (this.triangle[1].x - this.Ix)) + this.Ix
        this.By_prime = (this.k * (this.triangle[1].y - this.Iy)) + this.Iy

        this.Jx_prime = (this.k * (this.Jx - this.triangle[2].x)) + this.triangle[2].x
        this.Jy_prime = (this.k * (this.Jy - this.triangle[2].y)) + this.triangle[2].y
        this.Cx_prime = (this.k * (this.triangle[2].x - this.Jx)) + this.Jx
        this.Cy_prime = (this.k * (this.triangle[2].y - this.Jy)) + this.Jy
        this.k = 0.1
    }

    // ALTITUDES
    showAllAltitudes(sketch) {
        this.showAllAltitudeA(sketch)
        this.showAllAltitudeB(sketch)
        this.showAllAltitudeC(sketch)
    }
    showAllAltitudeA(sketch) {
        this.showAltitudeA(sketch)
        this.showRightSymbolsAltitudeA(sketch)
        this.showDottedLineA(sketch)
    }
    showAllAltitudeB(sketch) {
        this.showAltitudeB(sketch)
        this.showRightSymbolsAltitudeB(sketch)
        this.showDottedLineB(sketch)
    }
    showAllAltitudeC(sketch) {
        this.showAltitudeC(sketch)
        this.showRightSymbolsAltitudeC(sketch)
        this.showDottedLineC(sketch)
    }

    showAltitudes(sketch) {
        this.showAltitudeA(sketch)
        this.showAltitudeB(sketch)
        this.showAltitudeC(sketch)
    }
    showAltitudeA(sketch) {
        sketch.stroke(0, 255, 0)
        sketch.strokeWeight(3)
        // Draw altitude
        sketch.line(this.Hx_prime, this.Hy_prime, this.Ax_prime, this.Ay_prime)
    }
    showAltitudeB(sketch) {
        sketch.stroke(0, 255, 0)
        sketch.strokeWeight(3)

        // Draw altitude
        sketch.line(this.Ix_prime, this.Iy_prime, this.Bx_prime, this.By_prime)
    }
    showAltitudeC(sketch) {
        sketch.stroke(0, 255, 0)
        sketch.strokeWeight(3)
        // this.linedash(sketch, 0, 0, 1920, 1080, 10) //test
        // Draw altitude
        sketch.line(this.Jx_prime, this.Jy_prime, this.Cx_prime, this.Cy_prime)
    }

    getTriangleAltitudesCoordinates() {
        let mAB = (this.triangle[1].y - this.triangle[0].y) / (this.triangle[1].x - this.triangle[0].x)
        let mBC = (this.triangle[2].y - this.triangle[1].y) / (this.triangle[2].x - this.triangle[1].x)
        let mAC = (this.triangle[2].y - this.triangle[0].y) / (this.triangle[2].x - this.triangle[0].x)

        let bAB = this.triangle[0].y - mAB * this.triangle[0].x
        let bBC = this.triangle[1].y - mBC * this.triangle[1].x
        let bAC = this.triangle[0].y - mAC * this.triangle[0].x

        let mAH = -1 / mBC
        let mBI = -1 / mAC
        let mCJ = -1 / mAB

        let bAH = this.triangle[0].y - mAH * this.triangle[0].x
        let bBH = this.triangle[1].y - mBI * this.triangle[1].x
        let bCH = this.triangle[2].y - mCJ * this.triangle[2].x

        //intersection (BC) with (AH)
        this.Hx = (bAH - bBC) / (mBC - mAH)
        this.Hy = mBC * this.Hx + bBC

        //intersection (AC) with (BH)
        this.Ix = (bBH - bAC) / (mAC - mBI)
        this.Iy = mAC * this.Ix + bAC

        //intersection (AB) with (CH)
        this.Jx = (bCH - bAB) / (mAB - mCJ)
        this.Jy = mAB * this.Jx + bAB
    }

    showDottedLines(sketch) {
        this.showDottedLineA(sketch)
        this.showDottedLineB(sketch)
        this.showDottedLineC(sketch)
    }
    showDottedLineA(sketch) {
        this.k = 1.4
        if (this.angle_b > 90) { //BĈY is optus, draw dashlines is required
            let Lx = (this.k * (this.Hx - this.triangle[1].x)) + this.triangle[1].x
            let Ly = (this.k * (this.Hy - this.triangle[1].y)) + this.triangle[1].y

            let Mx = (this.k * (this.Jx - this.triangle[1].x)) + this.triangle[1].x
            let My = (this.k * (this.Jy - this.triangle[1].y)) + this.triangle[1].y

            //Draw dashlines
            sketch.stroke(10, 200, 10)
            sketch.strokeWeight(4)
            this.linedash(sketch, this.triangle[1].x, this.triangle[1].y, Lx, Ly, 10, '-') // A
        } else if (this.angle_c > 90) { //CBY is optus, draw dashlines is required
            let Lx = (this.k * (this.Hx - this.triangle[2].x)) + this.triangle[2].x
            let Ly = (this.k * (this.Hy - this.triangle[2].y)) + this.triangle[2].y

            let Mx = (this.k * (this.Ix - this.triangle[2].x)) + this.triangle[2].x
            let My = (this.k * (this.Iy - this.triangle[2].y)) + this.triangle[2].y

            //Draw dashlines
            sketch.stroke(10, 200, 10)
            sketch.strokeWeight(4)
            this.linedash(sketch, this.triangle[2].x, this.triangle[2].y, Lx, Ly, 10) // A
        }
    }

    showDottedLineB(sketch) {
        this.k = 1.4
        if (this.angle_a > 90) { //BÂC is optus, draw dashlines is required
            let Lx = (this.k * (this.Ix - this.triangle[0].x)) + this.triangle[0].x
            let Ly = (this.k * (this.Iy - this.triangle[0].y)) + this.triangle[0].y

            let Mx = (this.k * (this.Jx - this.triangle[0].x)) + this.triangle[0].x
            let My = (this.k * (this.Jy - this.triangle[0].y)) + this.triangle[0].y

            //Draw dashlines
            sketch.stroke(10, 200, 10)
            sketch.strokeWeight(4)
            this.linedash(sketch, this.triangle[0].x, this.triangle[0].y, Lx, Ly, 10, '-') // B
        } else if (this.angle_c > 90) { //CBY is optus, draw dashlines is required
            let Lx = (this.k * (this.Hx - this.triangle[2].x)) + this.triangle[2].x
            let Ly = (this.k * (this.Hy - this.triangle[2].y)) + this.triangle[2].y

            let Mx = (this.k * (this.Ix - this.triangle[2].x)) + this.triangle[2].x
            let My = (this.k * (this.Iy - this.triangle[2].y)) + this.triangle[2].y

            //Draw dashlines
            sketch.stroke(10, 200, 10)
            sketch.strokeWeight(4)
            this.linedash(sketch, this.triangle[2].x, this.triangle[2].y, Mx, My, 10) // B
        }
    }

    showDottedLineC(sketch) {
        this.k = 1.4
        if (this.angle_a > 90) { //BÂC is optus, draw dashlines is required
            let Lx = (this.k * (this.Ix - this.triangle[0].x)) + this.triangle[0].x
            let Ly = (this.k * (this.Iy - this.triangle[0].y)) + this.triangle[0].y

            let Mx = (this.k * (this.Jx - this.triangle[0].x)) + this.triangle[0].x
            let My = (this.k * (this.Jy - this.triangle[0].y)) + this.triangle[0].y

            //Draw dashlines
            sketch.stroke(10, 200, 10)
            sketch.strokeWeight(4)
            this.linedash(sketch, this.triangle[0].x, this.triangle[0].y, Mx, My, 10, '-') // C
        } else if (this.angle_b > 90) { //BĈY is optus, draw dashlines is required
            let Lx = (this.k * (this.Hx - this.triangle[1].x)) + this.triangle[1].x
            let Ly = (this.k * (this.Hy - this.triangle[1].y)) + this.triangle[1].y

            let Mx = (this.k * (this.Jx - this.triangle[1].x)) + this.triangle[1].x
            let My = (this.k * (this.Jy - this.triangle[1].y)) + this.triangle[1].y

            //Draw dashlines
            sketch.stroke(10, 200, 10)
            sketch.strokeWeight(4)
            this.linedash(sketch, this.triangle[1].x, this.triangle[1].y, Mx, My, 10, '-') // C
        }
    }

    linedash(sketch, x1, y1, x2, y2, delta, style = '-') {
        // delta is both the length of a dash, the distance between 2 dots/dashes, and the diameter of a round
        let distance = dist(x1, y1, x2, y2);
        let dashNumber = distance / delta;
        let xDelta = (x2 - x1) / dashNumber;
        let yDelta = (y2 - y1) / dashNumber;

        for (let i = 0; i < dashNumber; i += 2) {
            let xi1 = i * xDelta + x1;
            let yi1 = i * yDelta + y1;
            let xi2 = (i + 1) * xDelta + x1;
            let yi2 = (i + 1) * yDelta + y1;

            if (style == '-') {
                sketch.line(xi1, yi1, xi2, yi2);
            } else if (style == '.') {
                sketch.point(xi1, yi1);
            } else if (style == 'o') {
                sketch.ellipse(xi1, yi1, delta / 2);
            }
        }
    }

    computeAltitudesEqualSymbols() {
        this.k = 0.1
        this.H1 = createVector(this.Hx + this.k * (this.triangle[2].x - this.Hx), this.Hy + this.k * (this.triangle[2].y - this.Hy))
        this.H2 = createVector(this.Hx + this.k * (this.triangle[0].x - this.Hx), this.Hy + this.k * (this.triangle[0].y - this.Hy))
        this.H3 = createVector(this.H2.x + (this.H1.x - this.Hx), this.H2.y + (this.H1.y - this.Hy))

        this.I1 = createVector(this.Ix + this.k * (this.triangle[1].x - this.Ix), this.Iy + this.k * (this.triangle[1].y - this.Iy))
        this.I2 = createVector(this.Ix + this.k * (this.triangle[0].x - this.Ix), this.Iy + this.k * (this.triangle[0].y - this.Iy))
        this.I3 = createVector(this.I2.x + (this.I1.x - this.Ix), this.I2.y + (this.I1.y - this.Iy))

        this.J1 = createVector(this.Jx + this.k * (this.triangle[1].x - this.Jx), this.Jy + this.k * (this.triangle[1].y - this.Jy))
        this.J2 = createVector(this.Jx + this.k * (this.triangle[2].x - this.Jx), this.Jy + this.k * (this.triangle[2].y - this.Jy))
        this.J3 = createVector(this.J2.x + (this.J1.x - this.Jx), this.J2.y + (this.J1.y - this.Jy))
    }

    showRightSymbolsAltitudes(sketch) {
        this.showRightSymbolsAltitudeA(sketch)
        this.showRightSymbolsAltitudeB(sketch)
        this.showRightSymbolsAltitudeC(sketch)
    }
    showRightSymbolsAltitudeA(sketch) {
        sketch.stroke(0, 255, 0)
        sketch.strokeWeight(3)
        sketch.line(this.H2.x, this.H2.y, this.H3.x, this.H3.y)
        sketch.line(this.H3.x, this.H3.y, this.H1.x, this.H1.y)
    }
    showRightSymbolsAltitudeB(sketch) {
        sketch.stroke(0, 255, 0)
        sketch.strokeWeight(3)
        sketch.line(this.I2.x, this.I2.y, this.I3.x, this.I3.y)
        sketch.line(this.I3.x, this.I3.y, this.I1.x, this.I1.y)
    }
    showRightSymbolsAltitudeC(sketch) {
        sketch.stroke(0, 255, 0)
        sketch.strokeWeight(3)
        sketch.line(this.J2.x, this.J2.y, this.J3.x, this.J3.y)
        sketch.line(this.J3.x, this.J3.y, this.J1.x, this.J1.y)
    }

    showIsoceleEqualSymbols(sketch) {
        if (this.angle_a == this.angle_b) {
            sketch.stroke(255, 255, 0)
            sketch.noFill()
            sketch.strokeWeight(3)
            sketch.circle(this.middle3.x, this.middle3.y, 25)
            sketch.circle(this.middle3.x, this.middle3.y, 45)
            sketch.circle(this.middle2.x, this.middle2.y, 25)
            sketch.circle(this.middle2.x, this.middle2.y, 45)
        }
        if (this.angle_b == this.angle_c) {
            sketch.stroke(255, 255, 0)
            sketch.noFill()
            sketch.strokeWeight(3)
            sketch.circle(this.middle3.x, this.middle3.y, 25)
            sketch.circle(this.middle3.x, this.middle3.y, 45)
            sketch.circle(this.middle1.x, this.middle1.y, 25)
            sketch.circle(this.middle1.x, this.middle1.y, 45)
        }
        if (this.angle_a == this.angle_c) {
            sketch.stroke(255, 255, 0)
            sketch.noFill()
            sketch.strokeWeight(3)
            sketch.circle(this.middle1.x, this.middle1.y, 25)
            sketch.circle(this.middle1.x, this.middle1.y, 45)
            sketch.circle(this.middle2.x, this.middle2.y, 25)
            sketch.circle(this.middle2.x, this.middle2.y, 45)
        }
    }

    showEquilateralEqualSymbols(sketch) {
        if (this.angle_a == this.angle_b && this.angle_b == this.angle_c) {
            sketch.stroke(255, 255, 0)
            sketch.noFill()
            sketch.strokeWeight(3)
            sketch.circle(this.middle1.x, this.middle1.y, 40)
            sketch.circle(this.middle2.x, this.middle2.y, 40)
            sketch.circle(this.middle3.x, this.middle3.y, 40)
        }
    }

    sign(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }

    PointInTriangle(pt) {
        let d1, d2, d3;
        let has_neg, has_pos;

        d1 = this.sign(pt, this.triangle[0], this.triangle[1]);
        d2 = this.sign(pt, this.triangle[1], this.triangle[2]);
        d3 = this.sign(pt, this.triangle[2], this.triangle[0]);

        has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(has_neg && has_pos);
    }
}