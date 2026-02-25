// import {className} from "./components/file.js";

export const menu = new p5((sketch) => {
    sketch.name = "menu";
    sketch.activated = false;

    let font;
    let menu_state = false;
    let menu_is_opening = false;
    let menu_is_closing = false;
    let menu_app = 0;
    let number_of_apps = 2;

    let index_x_a = 0;
    let index_y_a = 0;
    let index_x_b = 0;
    let index_y_b = 0;
    let menu_position_x = 0;
    let menu_position_y = height / 2;
    let y_trigger = 0;
    let set_menu_position = true;
    let menu_width = 300;
    let menu_height = 600;
    let opening_menu_percentage = 0;
    let actual_width = 0;
    let actual_height = 0;
    let left_arrow_button_fill = 0
    let right_arrow_button_fill = 0
    let app_button_fill = 0
    let app_control_menu = []
    let no_menu_tutorial_apps = []
    let started_apps = []

    let cooldown_left_arrow = 0;
    let cooldown_right_arrow = 0;
    let cooldown_app_button = 0;

    let hands_position = [];

    let counter_menu_trigger = 0;
    let trigger_menu = false;
    let first_run = true;

    let fps
    let speed_regulator = 0;

    let menu_opening_time = 0;
    let automatic_menu_closing_time = 10000; // 10 seconds
    let app_starting_time = 0;
    let automatic_apps_closing_time = 60000; // 60 seconds
    let wait_for_closing_apps = false


    var audio_opening = new Audio("./platform/home/apps/menu/components/opening_menu.mp3");
    var closing_audio = new Audio("./platform/home/apps/menu/components/closing_menu.mp3");
    var click_audio = new Audio("./platform/home/apps/menu/components/click.mp3");

    let open_gif
    let close_gif

    sketch.preload = () => {
        font = loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");

        open_gif = sketch.createImg("./platform/home/apps/menu/components/hand_opening.gif");
        close_gif = sketch.createImg("./platform/home/apps/menu/components/hand_closing.gif");

        open_gif.id("open_gif");
        close_gif.id("close_gif");

        let url = getURLPath();
        url.splice(-1);
        url = url.join("/");
        config = loadJSON("/" + url + "/platform/home/config.json",
            (data) => {
                if (data.applications.menu_control) {
                    app_control_menu = data.applications.menu_control;
                    number_of_apps = app_control_menu.length;
                }
                if (data.applications.no_menu_tutorial_gif) {
                    no_menu_tutorial_apps = data.applications.no_menu_tutorial_gif;
                }
            });
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;

        socket.on(sketch.name, (data) => {
            if (data == undefined || data.length == 0) return;
            hands_position = data["hands_landmarks"];
            // hands_sign = data["hands_sign"];
        });

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };

        socket.on("core-app_manager-started_applications", async (data) => {
            started_apps = [];
            data.applications.forEach(app => {
                started_apps.push(app["name"])
            });
        });
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {};

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        //First run
        if (first_run) {
            first_run = false
            sketch.emit("core-app_manager-stop_application", {
                application_name: "balls",
            });
            sketch.emit("core-app_manager-start_application", {
                application_name: "balls",
            });
        }
        if (index_x_a != 0) {
            wait_for_closing_apps = false
            app_starting_time = millis();
        } else {
            wait_for_closing_apps = true
        }
        // if ((wait_for_closing_apps == true) && (millis() - app_starting_time > automatic_apps_closing_time)) {
        //     for (let a_no_gif_app of no_menu_tutorial_apps) {
        //         if (started_apps.includes(a_no_gif_app)) {
        //             sketch.emit("core-app_manager-stop_application", {
        //                 application_name: a_no_gif_app
        //             });
        //         };
        //     }
        // }

        open_gif.position(690, 500); //Increase X to move left on the pool
        document.getElementById("open_gif").style.visibility = "visible";
        document.getElementById("close_gif").style.visibility = "visible";
        close_gif.hide()
        open_gif.hide()

        if (!no_menu_tutorial_apps.some(a_no_gif_app => started_apps.includes(a_no_gif_app))) {
            open_gif.show()
        }

        fps = Math.round(frameRate());
        speed_regulator = 50 / fps;
        sketch.clear();

        //DEBUG MENU OPENING DISTANCE & trigger
        // if(trigger_menu) {sketch.stroke(255, 0, 0);}
        // else {sketch.stroke(0,255,0);}
        // sketch.strokeWeight(5);
        // sketch.line(width/2 - 45, height/2, width/2 + 45, height/2);
        // sketch.line(width/2 - 125, height/2+10, width/2 + 125, height/2+10);
        // sketch.line(width/2 - 250, height/2+20, width/2 + 250, height/2+20);

        //DRAWING SETUP
        sketch.stroke(255);
        sketch.fill(255);
        sketch.textFont(font);

        //DEBUG : Draw Pool borders
        // sketch.line(0, 0, 1920, 0);
        // sketch.line(0, 0, 0, 1080);
        // sketch.line(0, 1080, 1920, 1080);
        // sketch.line(1920, 0, 1920, 1080);
        // sketch.rect(50,50 , 1820, 980);

        //PROCESSING
        if (hands_position.length != 0) {
            index_x_a = hands_position[0][8][0] * width;
            index_y_a = hands_position[0][8][1] * height;
            sketch.circle(index_x_a, index_y_a, 20);
        } else {
            index_x_a = 0;
            index_y_a = 0;
        }
        if (hands_position.length > 1) {
            index_x_b = hands_position[1][8][0] * width;
            index_y_b = hands_position[1][8][1] * height;
            // sketch.circle(index_x_b, index_y_b, 20);
        } else {
            index_x_b = 0;
            index_y_b = 0;
        }
        check_menu_trigger();
        draw_menu(sketch);
        sketch.push()
        // sketch.translate(width/2 - 200, -150)
        sketch.translate(width / 2 - 200, height + 10)
        sketch.rotate(PI)
        sketch.textSize(60)
        sketch.text("Interactive Pool Project", 0, 0)
        sketch.pop()
        sketch.push()
        sketch.translate(width / 2 + 800, height + 10)
        sketch.rotate(PI)
        sketch.textSize(32)
        // sketch.text(`Display : ${average_fps} FPS`, 0, 0);
        sketch.text(`Display : ${fps} FPS`, 0, 0);
        sketch.pop()
    };

    function check_menu_trigger() {
        if (trigger_menu == true) {
            counter_menu_trigger++;
            if (counter_menu_trigger > 35) {
                trigger_menu = false;
                counter_menu_trigger = 0;
            }
        }
        if (index_x_a != 0 && index_y_a != 0 && index_x_b != 0 && index_y_b != 0) {
            let finger_gap_x = Math.abs(index_x_a - index_x_b)
            let finger_gap_y = Math.abs(index_y_a - index_y_b)
            if (menu_state == false) {
                if (finger_gap_x < 90 && finger_gap_y < 100) {
                    y_trigger = index_y_a;
                    trigger_menu = true;
                    counter_menu_trigger = 0;

                    menu_position_x = index_x_a
                }
                if (trigger_menu == true) {
                    if (finger_gap_x > 250 && finger_gap_x < 500 && Math.abs(y_trigger - index_y_a) < 70) {
                        menu_is_opening = true;
                        menu_is_closing = false;
                        menu_state = true;
                        trigger_menu = false;
                        counter_menu_trigger = 0;
                        audio_opening.play();
                        menu_opening_time = millis();
                    }
                }
            } else {
                if (finger_gap_x > 250 && finger_gap_x < 500 && finger_gap_y < 100 && Math.abs(menu_position_x - index_x_a) < 300) {
                    y_trigger = index_y_a;
                    trigger_menu = true;
                    counter_menu_trigger = 0;
                }
                if (trigger_menu == true) {
                    if (finger_gap_x < 90 && Math.abs(y_trigger - index_y_a) < 70) {
                        menu_is_opening = false;
                        menu_is_closing = true;
                        menu_state = false;
                        trigger_menu = false;
                        counter_menu_trigger = 0;
                        closing_audio.play();
                    }
                }
            }
        }
    }

    function draw_menu(sketch) {
        if (menu_state == true) {
            open_gif.hide()
            close_gif.position(840, 400);
            // sketch.circle(menu_position_x - 210, 400, 20);
            close_gif.show()
            if (index_x_a != 0) {
                menu_opening_time = millis();
            }
            if (millis() - menu_opening_time > automatic_menu_closing_time) {
                menu_is_opening = false;
                menu_is_closing = true;
                menu_state = false;
                trigger_menu = false;
                counter_menu_trigger = 0;
                closing_audio.play();
                menu_opening_time = 0;
            }
        }
        // sketch.textSize(32);
        // sketch.text(cooldown_app_button, 150, 100)
        if (cooldown_app_button >= 1) {
            cooldown_app_button += speed_regulator;
        }
        if (cooldown_app_button > 50) {
            cooldown_app_button = 0;
        }
        if (cooldown_left_arrow >= 1) {
            cooldown_left_arrow += speed_regulator;
        }
        if (cooldown_left_arrow > 50) {
            cooldown_left_arrow = 0;
        }
        if (cooldown_right_arrow >= 1) {
            cooldown_right_arrow += speed_regulator;
        }
        if (cooldown_right_arrow > 50) {
            cooldown_right_arrow = 0;
        }

        if (menu_is_opening) { //OPEN MENU
            if (set_menu_position) {
                // menu_position_x = index_x_a;
                set_menu_position = false;
                // menu_position_y = index_y_a;
                if (menu_position_x < menu_width / 2 + 50) {
                    menu_position_x = menu_width / 2 + 50;
                }
                if (menu_position_x > width - menu_width / 2 - 50) {
                    menu_position_x = width - menu_width / 2 - 50;
                }
            }
            opening_menu_percentage += 5;
            actual_width = opening_menu_percentage * menu_width / 100;
            actual_height = opening_menu_percentage * menu_height / 100;
            if (opening_menu_percentage == 100) {
                menu_is_opening = false;
                menu_state = true;
            }
        }
        if (menu_is_closing) { //CLOSE MENU
            opening_menu_percentage -= 5;
            actual_width = opening_menu_percentage * menu_width / 100;
            actual_height = opening_menu_percentage * menu_height / 100;
            if (opening_menu_percentage == 0) {
                menu_state = false;
                menu_is_closing = false;
                set_menu_position = true;
            }
        }

        sketch.push()
        sketch.translate(menu_position_x, menu_position_y)
        sketch.rotate(PI)
        sketch.rectMode(CENTER);
        sketch.noFill()
        sketch.rect(0, 0, actual_width, actual_height);

        if (menu_state) {
            sketch.stroke(255);
            sketch.fill(255)
            sketch.textAlign(CENTER, CENTER);
            sketch.textSize(40);
            sketch.text("- MENU -", 0, -(menu_height / 2) * 0.8);
            sketch.textSize(28);
            sketch.text("Keep your index on\nan app to launch it", 0, -(menu_height / 2) * 0.6);

            drawApp(sketch)

            // Draw arrow buttons
            sketch.noFill()
            sketch.push()
            sketch.translate(0, (menu_height / 2) * 0.75)
            sketch.rectMode(CORNER)
            sketch.rect(-menu_width * 0.35, -menu_height * 0.05, menu_width * 0.35, menu_height * 0.1)
            sketch.rect(0, -menu_height * 0.05, menu_width * 0.35, menu_height * 0.1)
            sketch.fill(255)
            sketch.triangle(-menu_width * 0.150, -menu_height * 0.03, -menu_width * 0.150, menu_height * 0.03, -menu_width * 0.225, 0)
            sketch.triangle(menu_width * 0.150, -menu_height * 0.03, menu_width * 0.150, menu_height * 0.03, menu_width * 0.225, 0)

            // Fill arrow buttons on selection
            sketch.fill(125)
            if (index_x_a > menu_position_x - menu_width * 0.35 && index_x_a < menu_position_x &&
                index_y_a < menu_position_y - menu_height * 0.325 &&
                index_y_a > menu_position_y - menu_height * 0.425 &&
                cooldown_left_arrow == 0) {
                right_arrow_button_fill += speed_regulator * 2;
            } else {
                right_arrow_button_fill = 0;
            }
            sketch.rect(-menu_width * 0.35, -menu_height * 0.05, left_arrow_button_fill, menu_height * 0.1)
            if (index_x_a > menu_position_x && index_x_a < menu_position_x + menu_width * 0.35 &&
                index_y_a < menu_position_y - menu_height * 0.325 &&
                index_y_a > menu_position_y - menu_height * 0.425 &&
                cooldown_right_arrow == 0
            ) {
                left_arrow_button_fill += speed_regulator * 2;
            } else {
                left_arrow_button_fill = 0;
            }
            sketch.rect(0, -menu_height * 0.05, right_arrow_button_fill, menu_height * 0.1)

            // Trigger if arrow buttons are selected
            if (left_arrow_button_fill > menu_width * 0.35) {
                left_arrow_button_fill = 0;
                menu_app -= 1;
                cooldown_right_arrow = 1;
                click_audio.play();
            }
            if (right_arrow_button_fill > menu_width * 0.35) {
                right_arrow_button_fill = 0;
                menu_app += 1;
                cooldown_left_arrow = 1;
                click_audio.play();
            }
            if (menu_app == number_of_apps) {
                menu_app = 0;
            } else if (menu_app == -1) {
                menu_app = number_of_apps - 1;
            }
            sketch.pop()
        }
        sketch.pop()
        // sketch.circle(menu_position_x - menu_width*0.35, menu_position_y - menu_height*0.25, 50)
        // sketch.circle(menu_position_x + menu_width*0.35, menu_position_y + menu_height*0.15, 50)
    };

    function drawApp(sketch) {
        //App rectangle
        sketch.rectMode(CORNER);
        sketch.noFill()
        sketch.strokeWeight(5)
        sketch.stroke(216, 191, 216)

        if (started_apps.includes(app_control_menu[menu_app])) {
            sketch.stroke(0, 255, 127)
        }

        sketch.rect(-menu_width * 0.35, -menu_height * 0.15, menu_width * 0.7, menu_height * 0.4)

        sketch.fill(125)
        sketch.noStroke()
        //Fill app button on selection
        if (index_x_a > menu_position_x - menu_width * 0.35 && index_x_a < menu_position_x + menu_width * 0.35 &&
            index_y_a > menu_position_y - menu_height * 0.25 &&
            index_y_a < menu_position_y + menu_height * 0.15 &&
            cooldown_app_button == 0) {
            app_button_fill += speed_regulator * 4;
            sketch.rect(-menu_width * 0.35, -menu_height * 0.15, app_button_fill, menu_height * 0.4)
        } else {
            app_button_fill = 0;
        }

        sketch.stroke(255)
        sketch.strokeWeight(1)
        //Draw app icon
        sketch.fill(255)
        sketch.textSize(38);
        let translate_y_app_name = -5;
        let app_name = app_control_menu[menu_app].charAt(0).toUpperCase() + app_control_menu[menu_app].slice(1);
        let underscore_occurence = (app_name.match(/_/g) || []).length
        if (underscore_occurence == 1) {
            translate_y_app_name = -35;
        } else if (underscore_occurence == 2) {
            translate_y_app_name = -60;
        }
        sketch.text(app_name.replaceAll("_", "\n"), -menu_width * 0.34, -menu_height * 0.15 + translate_y_app_name, menu_width * 0.7, menu_height * 0.4)


        //Trigger if app button is selected
        if (app_button_fill > menu_width * 0.7) {
            app_button_fill = 0;
            cooldown_app_button = 1;
            click_audio.play();
            if (started_apps.includes(app_control_menu[menu_app])) {
                //stop app
                sketch.emit("core-app_manager-stop_application", {
                    application_name: app_control_menu[menu_app],
                });
            } else {
                // Launch app
                sketch.emit("core-app_manager-start_application", {
                    application_name: app_control_menu[menu_app],
                });
                app_starting_time = millis();
            }
        }
    }
});
