export class Affine {
    constructor(b1, b2, color="#009dff")
    {
        this.b1 = b1
        this.b2 = b2
        this.color = color
        this.b1_grid_x = this.convert_screen_to_grid_x(this.b1.x)
        this.b1_grid_y = this.convert_screen_to_grid_y(this.b1.y)
        this.b2_grid_x = this.convert_screen_to_grid_x(this.b2.x)
        this.b2_grid_y = this.convert_screen_to_grid_y(this.b2.y)
        this.x_left
        this.y_left
        this.x_right
        this.y_right
        this.slope = 1
        this.intercept = 1
        this.number_of_x = 22
        this.number_of_y = 12
    }

    show(sketch, f) {
        if(this.b1.x != this.b2.x) {
            this.b1_grid_x = this.convert_screen_to_grid_x(this.b1.x)
            this.b1_grid_y = this.convert_screen_to_grid_y(this.b1.y)
            this.b2_grid_x = this.convert_screen_to_grid_x(this.b2.x)
            this.b2_grid_y = this.convert_screen_to_grid_y(this.b2.y)
            this.compute_affine_parameters()

            //DEBUG
            // sketch.textFont(f);
            // sketch.textSize(40);
            // sketch.fill(0, 0, 255);
            // sketch.text(`B1(${this.b1_grid_x}, ${this.b1_grid_y})`, 960, -400)
            // sketch.text(`B2(${this.b2_grid_x}, ${this.b2_grid_y})`, 960, -300)
            // sketch.text(`y = ${this.slope} x + ${this.intercept}`, 960, -100)

            // this.draw_grid(sketch, f)
            if(this.b1.x >= 0 && this.b2.x >= 0) {
                this.draw_affine_line(sketch) 
                this.draw_line_equations(sketch,f)
            }
        }
    }
    
    draw_grid(sketch, f) {
        //Rotate the grid
        
        let case_width = width / this.number_of_x
        let case_height = height / this.number_of_y
        
        //Draw a grid
        // for (var x = 0; x < width + 1; x += case_width) {
        //     for (var y = 0; y < height + 1; y += case_height) {
        //         sketch.stroke(100, 100, 100);
        //         sketch.strokeWeight(1);
        //         sketch.line(x, 0, x, height);
        //         sketch.line(0, y, width, y);
        //     }
        // }
        sketch.stroke(200,200,200);
        sketch.strokeWeight(5)

        //Draw origin and X - Y axes
        sketch.line(0,540,width-70,540)
        sketch.line(960,70,960,height)
        sketch.circle(960,540, 20)
        sketch.push()
        sketch.translate(0,70)
        sketch.line(960 - case_width/2, case_height/2, 960, 0)
        sketch.line(960 + case_width/2, case_height/2, 960, 0)
        sketch.pop()
        sketch.push()
        sketch.translate(-70,0)
        sketch.line(1920 - case_width/2, 540 - case_height/2, width,540)
        sketch.line(1920 - case_width/2, 540 + case_height/2, width,540)
        sketch.pop()
        sketch.textFont(f);
        sketch.textSize(40);
        sketch.fill(200, 200, 200);
        sketch.text("O", 960 - 35, 540 + 35)
        sketch.text("x", 1920 - 30 - 70, 540+65)
        sketch.text("y", 960 + 55, 45 + 70)
        
        //Draw graduations
        for (var x = 0; x < width+1 - 2*case_width; x += case_width) {
            sketch.line(x, 540 - 20, x, 540+20)
        }
        for (var y = 2*case_height; y < height + 1; y += case_height) {
            sketch.line(960 - 20, y, 960 +20, y)
        }
        let i = -1;
        for (var x = 960-case_width-10; x < width - 2*case_width ; x += case_width) {
            if (i != 0) {
                sketch.text(`${i}`, x, 600)
            }
            i++;
        }
        let j = -1;
        for (var y = 540+case_height+10; y>case_height*2 ; y -= case_height) {
            if (j != 0) {
                sketch.text(`${j}`, 900, y)
            }
            j++;
        }
    }
    
    draw_affine_line(sketch) {
        
        this.x_left  = 0;
        this.y_left  = 0;
        this.x_right = 0;
        this.y_right = 0;
        this.x_left  = -this.number_of_x/2
        this.y_left  = this.slope * this.x_left + this.intercept
        this.x_right = this.number_of_x/2
        this.y_right = this.slope * this.x_right + this.intercept

        if(this.y_left < -this.number_of_y/2) {
            this.y_left = -this.number_of_y/2
            this.x_left = (this.y_left - this.intercept) / this.slope
        }
        if(this.y_left > this.number_of_y/2) {
            this.y_left = this.number_of_y/2
            this.x_left = (this.y_left - this.intercept) / this.slope
        }
        if(this.y_right < -this.number_of_y/2) {
            this.y_right = -this.number_of_y/2
            this.x_right = (this.y_right - this.intercept) / this.slope
        }
        if(this.y_right > this.number_of_y/2) {
            this.y_right = this.number_of_y/2
            this.x_right = (this.y_right - this.intercept) / this.slope
        }
        this.y_left = this.convert_grid_to_screen_y(this.y_left)
        this.x_left = this.convert_grid_to_screen_x(this.x_left)
        this.y_right = this.convert_grid_to_screen_y(this.y_right)
        this.x_right = this.convert_grid_to_screen_x(this.x_right )
        
        sketch.stroke(this.color)
        sketch.line(this.x_left, this.y_left, this.x_right, this.y_right)
    }

    draw_line_equations(sketch, f) {
        sketch.textFont(f);
        sketch.textSize(40);
        sketch.fill(this.color);
        let a_rounded = Math.round(this.slope * 10) / 10
        let b_rounded = Math.round(this.intercept * 10) / 10
        if(b_rounded == 0) {
            if(a_rounded != 0) {
                b_rounded = ""
            }
        }
        else if(b_rounded > 0) {
            if(a_rounded != 0) {
            b_rounded = "+ " + b_rounded
            }
        }
        if(a_rounded == 0) {
            a_rounded = ""
        } 
        else if (a_rounded == 1)
        {
            a_rounded = "x"
        } 
        else if (a_rounded == -1) {
            a_rounded = "-x"
        }
        else {
            a_rounded = a_rounded + "x"
        }
        //Compute display position of the equation text
        let x_text = this.convert_screen_to_grid_x(this.x_right - 300)
        // console.log(x_text)
        let y_text = this.slope * x_text + this.intercept //-3.40
        if(this.slope > 0) {
            y_text = y_text - 0.5
        }
        else if (this.slope <= 0) {
            y_text = y_text + 0.5
        }
        x_text = this.convert_grid_to_screen_x(x_text)
        y_text = this.convert_grid_to_screen_y(y_text)
        // console.log(x_text, y_text)
        sketch.text(`y = ${a_rounded} ${b_rounded}`, x_text, y_text)
        
    }

    compute_affine_parameters() {
        this.slope = (this.b2_grid_y - this.b1_grid_y) / (this.b2_grid_x - this.b1_grid_x)
        this.intercept = this.b1_grid_y - (this.slope * this.b1_grid_x)
    }
    
    convert_screen_to_grid_x(x) {
        return (x * (this.number_of_x/1920)) - this.number_of_x/2 //1920 and not width for debug reasons
    }

    convert_screen_to_grid_y(y) {
        return -1 * (y * (this.number_of_y/1080) - this.number_of_y/2) //1080 and not height for debug reasons
    }

    convert_grid_to_screen_x(x) {
        return 1920 * (x + this.number_of_x/2) / this.number_of_x
    }

    convert_grid_to_screen_y(y) {
        return (-1 * 1080 * (y + this.number_of_y/2) / this.number_of_y) +1080
    }
}
