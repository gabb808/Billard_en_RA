import {Ball} from "./ball.js"
import {Affine} from "./affine.js"

let max_ball = 20; //Min 9

export class Balls {
    constructor()
    {
        this.balls = []
        this.ball_nb = 0
        this.previous_ball_nb = max_ball;

        for(let i=0; i<max_ball; i++)
        {
            let b=new Ball(-500,-500)
            this.balls.push(b)
        }
        this.grid = []
        this.grid.push(new Affine(this.balls[0],this.balls[1], "#009dff"))
        this.grid.push(new Affine(this.balls[2],this.balls[3], "#38ff15"));
        // this.grid.push(new Affine(this.balls[4],this.balls[5], "#ff8c40"));

    }

    show(sketch, f) {
        sketch.push();
        sketch.translate(width,height)
        sketch.mode = sketch.CENTER
        sketch.rotate(sketch.PI)
        if(this.grid.length != 0) {
            this.grid[0].draw_grid(sketch, f)
        }
        for(let i =0; i<this.grid.length; i++)
        {
            this.grid[i].show(sketch, f)
        }
        for (let ball of this.balls)
        {
            ball.show(sketch)
        }
        this.show_menu(sketch)
        sketch.pop();
    }

    show_menu(sketch) {
        sketch.fullscreen()
        sketch.push();
        
        sketch.pop();
    }

    update_data(data) {
        if (data == undefined)  return;
        this.data = data;
    }

    update(){
        if (this.data == undefined) return;
        this.ball_nb = 0
        for (let b of this.data){
            if (this.ball_nb >= max_ball) break
            // this.balls[this.ball_nb].x = b[0]
            // this.balls[this.ball_nb].y = b[1]
            // Must apply central symmetry because of 180° rotation
            this.balls[this.ball_nb].x = -(b[0] - 960) + 960
            this.balls[this.ball_nb].y = -(b[1] - 540) + 540
            this.ball_nb += 1
        }
        for (let i = this.ball_nb; i<this.previous_ball_nb; i++)
        {
            this.balls[i].x = -500;
            this.balls[i].y = -500;
        }
        this.previous_ball_nb = this.ball_nb
    }
}
