import { Ball } from "./ball.js";
import {Triangle} from "./triangle.js"

// let rectangle_box1 = [360, 850, 55, 55]
let max_ball = 20; //Min 9

export class Balls {
    constructor()
    {
        this.balls = []
        this.triangles = []
        this.boxes = []
        this.ball_nb = 0
        this.previous_ball_nb = max_ball;
        this.triangle_nb = 0;

        for(let i=0; i<max_ball; i++)
        {
            let b=new Ball(-500,-500)
            this.balls.push(b)
        }
        // this.balls[0].x = 600
        // console.log(this.balls[0].x)
        // console.log(this.balls[0])

        this.triangles.push(new Triangle(this.balls[0],this.balls[1],this.balls[2]));
        this.triangles.push(new Triangle(this.balls[3],this.balls[4],this.balls[5]));
        this.triangles.push(new Triangle(this.balls[6],this.balls[7],this.balls[8]));

        this.button_coords = [[120, 555, 55, 55],
        [120, 430, 55, 55],
        [120, 305, 55, 55],
        [120, 180, 55, 55]]
        // console.log(this.triangles[0])

        // pool_coords = loadJSON('/calibration/calibration_data.json');
        // console.log(pool_coords.pool_coords[0])
    }

    show(sketch, f) {
        sketch.push();

        if(this.boxes[3]==true)
        {
            for (let i=0; i< this.triangle_nb; i++)
            {
                this.triangles[i].showCircumCircle(sketch)
            }
        }
        if(this.boxes[0]==true)
        {
            for (let i=0; i< this.triangle_nb; i++)
            {
                // console.log(this.triangles[i])
                // console.log(this.triangle_nb) //okay
                this.triangles[i].show(sketch);
                this.triangles[i].showAngle(sketch,f);
            }
        }
        if(this.boxes[1]==true)
        {
            for (let i=0; i< this.triangle_nb; i++)
            {
                this.triangles[i].showCentroid(sketch);
                this.triangles[i].showMediane(sketch);

            }
        }
        if(this.boxes[2]==true)
        {
            for (let i=0; i< this.triangle_nb; i++)
            {
                this.triangles[i].showPerpendicularBisector(sketch)
            }
        }
        this.show_menu(sketch)
        sketch.pop();
    }

    show_menu(sketch) {
        sketch.fullscreen()
        // line(0,1080,1920,0)
        // line(0,0,1920,1080)
        // line(0,0,1920,0)
        // line(0,0,0,1080)
        // line(0,1080,1920,1080)
        // line(1920,0,1920,1080)

        sketch.push();
        sketch.strokeWeight(5)
        sketch.noFill()
        // this.balls[0].x = this.balls[0].x + frameCount
        let t = 0;
        for(let i=0; i < 4; i++) {
            if(this.boxes[i] == true) {
                sketch.stroke(0,255,0)
            }
            else
            {
                sketch.stroke(255)
            }
            sketch.rect(this.button_coords[i][0], this.button_coords[i][1],this.button_coords[i][2],this.button_coords[i][3]);
            t += 125;
        }
        sketch.pop();
    }

    update_data(data) {
        if (data == undefined)  return;
        this.data = data;
    }

    RectContainCoords(x, y, w, h,a,b) {
        return x <= a && a <= x + w && y <= b && b <= y + h;
    }

    update(){
        if (this.data == undefined) return;
        this.ball_nb = 0

        this.boxes[0] = false
        this.boxes[1] = false
        this.boxes[2] = false
        this.boxes[3] = false

        for (let b of this.data){
            if(this.RectContainCoords(this.button_coords[0][0], this.button_coords[0][1],this.button_coords[0][2],this.button_coords[0][3] ,b[0],b[1]))
            {
                this.boxes[0] = true
            }
            else if(this.RectContainCoords(this.button_coords[1][0], this.button_coords[1][1],this.button_coords[1][2],this.button_coords[1][3],b[0],b[1]))
            {
                this.boxes[1] = true;
            }
            else if(this.RectContainCoords(this.button_coords[2][0], this.button_coords[2][1],this.button_coords[2][2],this.button_coords[2][3],b[0],b[1]))
            {
                this.boxes[2] = true;
            }
            else if(this.RectContainCoords(this.button_coords[3][0], this.button_coords[3][1],this.button_coords[3][2],this.button_coords[3][3],b[0],b[1]))
            {
                this.boxes[3] = true;
            }
            else
            {
                if (this.ball_nb >= max_ball) break
                this.balls[this.ball_nb].x = b[0]
                this.balls[this.ball_nb].y = b[1]
                this.ball_nb += 1
            }
        }
        for (let i = this.ball_nb; i<this.previous_ball_nb; i++)
        {
            this.balls[i].x = -500;
            this.balls[i].y = -500;
        }
        this.previous_ball_nb = this.ball_nb
        this.triangle_nb = floor(this.ball_nb/3)
        // console.log(this.triangle_nb)
        if(this.triangle_nb>=4)
        {
            this.triangle_nb=3
        }
        for (let i = 0; i< this.triangle_nb; i++)
        {
            this.triangles[i].updateTriangleInfos()
        }

    }

    distanceOf2Balls(index_ball_1,index_ball_2){
        return round(dist(this.balls[index_ball_1].x,
                    this.balls[index_ball_1].y,
                    this.balls[index_ball_2].x,
                    this.balls[index_ball_2].y,),3)
    }

    calculateAngle(index_ball_1,index_ball_2,index_ball_3) { //angle around balls_index_2
        return round(acos(this.distanceOf2Balls(index_ball_2,index_ball_3)
                        / this.distanceOf2Balls(index_ball_1,index_ball_2)) * 180 / PI)
    }
}
