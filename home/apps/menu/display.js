// Menu amélioré avec système de catégories et grille d'applications
// VERSION CORRIGÉE: Interaction au doigt, rotation 180°, feedback amélioré

export const menu = new p5((sketch) => {
    sketch.name = "menu";
    sketch.activated = false;

    // ========== VARIABLES ==========
    let font;
    let menu_state = false;
    let menu_is_opening = false;
    let menu_is_closing = false;
    let opening_menu_percentage = 0;

    let index_x_a = 0;
    let index_y_a = 0;
    let index_x_b = 0;
    let index_y_b = 0;
    let menu_position_x = 0;
    let menu_position_y = height / 2;
    let y_trigger = 0;
    let set_menu_position = true;

    let menu_width = 950;
    let menu_height = 750;
    let actual_width = 0;
    let actual_height = 0;

    let hands_position = [];
    let counter_menu_trigger = 0;
    let trigger_menu = false;
    let first_run = true;

    let fps;
    let speed_regulator = 0;

    let menu_opening_time = 0;
    let automatic_menu_closing_time = 15000;

    // Sons et GIFs
    var audio_opening = new Audio("./home/apps/menu/components/opening_menu.mp3");
    var closing_audio = new Audio("./home/apps/menu/components/closing_menu.mp3");
    var click_audio = new Audio("./home/apps/menu/components/click.mp3");

    let open_gif, close_gif;

    // Structure du menu
    let app_control_menu = [];
    let app_metadata = {};
    let categories = {};
    let current_category = 0;
    let category_list = [];
    let no_menu_tutorial_apps = [];
    let started_apps = [];

    // Grille et sélection
    let grid_cols = 3;
    let grid_rows = 2;
    let cell_padding = 15;
    let cooldown_select = 0;
    let cell_hover_strength = [];
    
    // Pour interaction
    let hovered_cell_idx = -1;

    // ========== PRELOAD ==========
    sketch.preload = () => {
        font = loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");

        open_gif = sketch.createImg("./home/apps/menu/components/hand_opening.gif");
        close_gif = sketch.createImg("./home/apps/menu/components/hand_closing.gif");

        open_gif.id("open_gif");
        close_gif.id("close_gif");

        let url = getURLPath();
        url.splice(-1);
        url = url.join("/");
        config = loadJSON("/" + url + "/platform/home/config.json", (data) => {
            if (data.applications.menu_control) {
                app_control_menu = data.applications.menu_control;
            }
            if (data.app_metadata) {
                app_metadata = data.app_metadata;
                organizeByCategories();
            }
            if (data.applications.no_menu_tutorial_gif) {
                no_menu_tutorial_apps = data.applications.no_menu_tutorial_gif;
            }
        });
    };

    function organizeByCategories() {
        categories = {};
        for (let app of app_control_menu) {
            if (app_metadata[app]) {
                let cat = app_metadata[app].category || "Autres";
                if (!categories[cat]) {
                    categories[cat] = [];
                }
                categories[cat].push(app);
            }
        }
        category_list = Object.keys(categories).sort();
        if (category_list.length === 0) {
            category_list = ["Tous"];
            categories["Tous"] = app_control_menu;
        }
    }

    // ========== INITIALISATION ==========
    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;

        socket.on(sketch.name, (data) => {
            if (data == undefined || data.length == 0) return;
            hands_position = data["hands_landmarks"];
        });

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };

        socket.on("core-app_manager-started_applications", async (data) => {
            started_apps = [];
            data.applications.forEach(app => {
                started_apps.push(app["name"]);
            });
        });
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {};
    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    // ========== AFFICHAGE PRINCIPAL ==========
    sketch.show = () => {
        // Première exécution
        if (first_run) {
            first_run = false;
            sketch.emit("core-app_manager-stop_application", { application_name: "balls" });
            sketch.emit("core-app_manager-start_application", { application_name: "balls" });
        }

        // Gestion des GIFs
        open_gif.position(690, 500);
        close_gif.position(840, 400);
        document.getElementById("open_gif").style.visibility = "visible";
        document.getElementById("close_gif").style.visibility = "visible";
        close_gif.hide();
        open_gif.hide();

        if (!no_menu_tutorial_apps.some(a_no_gif_app => started_apps.includes(a_no_gif_app))) {
            open_gif.show();
        }

        fps = Math.round(frameRate());
        speed_regulator = 50 / fps;
        sketch.clear();

        // Configuration de dessin
        sketch.stroke(255);
        sketch.fill(255);
        sketch.textFont(font);

        // Détection des positions des mains
        if (hands_position.length > 0) {
            index_x_a = hands_position[0][8][0] * width;
            index_y_a = hands_position[0][8][1] * height;
            sketch.push();
            sketch.fill(255, 100, 150, 200);
            sketch.noStroke();
            sketch.circle(index_x_a, index_y_a, 25);
            // Point intérieur blanc pour visibilité
            sketch.fill(255, 255, 255);
            sketch.circle(index_x_a, index_y_a, 12);
            sketch.pop();
        } else {
            index_x_a = 0;
            index_y_a = 0;
        }

        if (hands_position.length > 1) {
            index_x_b = hands_position[1][8][0] * width;
            index_y_b = hands_position[1][8][1] * height;
        } else {
            index_x_b = 0;
            index_y_b = 0;
        }

        check_menu_trigger();
        draw_menu(sketch);

        // Affichage du titre
        sketch.push();
        sketch.translate(width / 2 - 250, -150);
        sketch.fill(255);
        sketch.stroke(255);
        sketch.textSize(50);
        sketch.textAlign(LEFT);
        sketch.text("Interactive Pool", 0, 0);
        sketch.pop();

        // Affichage des FPS
        sketch.push();
        sketch.translate(width - 300, height - 50);
        sketch.fill(255);
        sketch.textSize(24);
        sketch.textAlign(LEFT);
        sketch.text(`FPS: ${fps}`, 0, 0);
        sketch.pop();
    };

    // ========== DÉTECTION DES GESTES ==========
    function check_menu_trigger() {
        if (trigger_menu == true) {
            counter_menu_trigger++;
            if (counter_menu_trigger > 35) {
                trigger_menu = false;
                counter_menu_trigger = 0;
            }
        }

        if (index_x_a != 0 && index_y_a != 0 && index_x_b != 0 && index_y_b != 0) {
            let finger_gap_x = Math.abs(index_x_a - index_x_b);
            let finger_gap_y = Math.abs(index_y_a - index_y_b);

            if (menu_state == false) {
                if (finger_gap_x < 90 && finger_gap_y < 100) {
                    y_trigger = index_y_a;
                    trigger_menu = true;
                    counter_menu_trigger = 0;
                    menu_position_x = index_x_a;
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
                        selected_grid_x = 0;
                        selected_grid_y = 0;
                    }
                }
            } else {
                if (finger_gap_x > 250 && finger_gap_x < 500 && finger_gap_y < 100 && 
                    Math.abs(menu_position_x - index_x_a) < 300) {
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

                if (index_x_a != 0 && menu_state) {
                    menu_opening_time = millis();
                }
            }
        }
    }

    // ========== AFFICHAGE DU MENU ==========
    function draw_menu(sketch) {
        // Gestion des animations d'ouverture/fermeture
        if (menu_is_opening) {
            if (set_menu_position) {
                set_menu_position = false;
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
            if (opening_menu_percentage >= 100) {
                menu_is_opening = false;
                menu_state = true;
                opening_menu_percentage = 100;
            }
        }

        if (menu_is_closing) {
            opening_menu_percentage -= 5;
            actual_width = opening_menu_percentage * menu_width / 100;
            actual_height = opening_menu_percentage * menu_height / 100;
            if (opening_menu_percentage <= 0) {
                menu_state = false;
                menu_is_closing = false;
                set_menu_position = true;
                opening_menu_percentage = 0;
            }
        }

        // Auto-fermeture après inactivité
        if (menu_state && !menu_is_closing) {
            if (millis() - menu_opening_time > automatic_menu_closing_time) {
                menu_is_closing = true;
                closing_audio.play();
            }
        }

        // Dessin du menu AVEC ROTATION 180°
        sketch.push();
        sketch.translate(menu_position_x, menu_position_y);
        sketch.rotate(PI); // ← ROTATION 180°

        // Fond du menu
        sketch.noFill();
        sketch.stroke(255);
        sketch.strokeWeight(3);
        sketch.rectMode(CENTER);
        
        sketch.fill(0, 0, 0, 100);
        sketch.rect(0, 0, actual_width + 4, actual_height + 4);
        
        sketch.fill(20, 20, 40);
        sketch.stroke(100, 150, 255);
        sketch.strokeWeight(2);
        sketch.rect(0, 0, actual_width, actual_height);

        if (menu_state && opening_menu_percentage >= 90) {
            draw_menu_content(sketch);
        }

        sketch.pop();

        // Gestion des GIFs de fermeture
        if (menu_state) {
            close_gif.show();
            open_gif.hide();
        }
    }

    // ========== CONTENU DU MENU ==========
    function draw_menu_content(sketch) {
        sketch.fill(255);
        sketch.stroke(255);
        sketch.textAlign(CENTER, CENTER);

        // En-tête de menu
        sketch.push();
        sketch.translate(0, -menu_height / 2 + 40);
        sketch.textSize(36);
        sketch.strokeWeight(0);
        sketch.text("🎮 MENU", 0, 0);
        sketch.pop();

        // Barre de catégories
        let category_bar_y = -menu_height / 2 + 90;
        let category_width = menu_width / category_list.length - 10;
        let category_x_start = -menu_width / 2 + 20;

        if (category_list.length > 1) {
            sketch.push();
            sketch.translate(0, category_bar_y);
            for (let i = 0; i < category_list.length; i++) {
                let cat_x = category_x_start + (i * (category_width + 10)) + category_width / 2;
                let cat_name = category_list[i];

                // Bouton catégorie
                sketch.stroke(i === current_category ? 100 : 150, i === current_category ? 200 : 100, 255);
                sketch.strokeWeight(i === current_category ? 3 : 1);
                if (i === current_category) {
                    sketch.fill(50, 80, 150);
                } else {
                    sketch.fill(20, 20, 40);
                }
                sketch.rect(cat_x, 0, category_width, 35, 5);

                sketch.fill(255);
                sketch.textSize(16);
                sketch.text(cat_name, cat_x, 0);
            }
            sketch.pop();
        }

        // Grille d'applications
        let current_apps = categories[category_list[current_category]] || [];
        let grid_start_y = -menu_height / 2 + 160;
        let grid_cell_width = (menu_width - 40) / grid_cols;
        let grid_cell_height = (menu_height - 250) / grid_rows;

        sketch.push();
        sketch.translate(-menu_width / 2 + 20, grid_start_y);

        for (let y = 0; y < grid_rows; y++) {
            for (let x = 0; x < grid_cols; x++) {
                let idx = y * grid_cols + x;
                if (idx < current_apps.length) {
                    let app_name = current_apps[idx];
                    let app_meta = app_metadata[app_name] || {};
                    let cell_x = x * grid_cell_width + grid_cell_width / 2;
                    let cell_y = y * grid_cell_height + grid_cell_height / 2;

                    if (!cell_hover_strength[idx]) cell_hover_strength[idx] = 0;

                    let cell_left = cell_x - grid_cell_width / 2 + cell_padding;
                    let cell_right = cell_x + grid_cell_width / 2 - cell_padding;
                    let cell_top = cell_y - grid_cell_height / 2 + cell_padding;
                    let cell_bottom = cell_y + grid_cell_height / 2 - cell_padding;

                    // FIX: Calcul correct de la position avec la rotation 180°
                    // Inverser les coordonnées à cause de rotate(PI)
                    let inv_x = -index_x_a + menu_position_x * 2;
                    let inv_y = -index_y_a + menu_position_y * 2;
                    
                    let local_x = inv_x - (menu_position_x - menu_width / 2 + 20);
                    let local_y = inv_y - (menu_position_y + grid_start_y);

                    let is_hovering = (local_x > cell_left && local_x < cell_right &&
                                     local_y > cell_top && local_y < cell_bottom);

                    if (is_hovering) {
                        cell_hover_strength[idx] = min(100, cell_hover_strength[idx] + speed_regulator * 4);
                        hovered_cell_idx = idx;
                    } else {
                        cell_hover_strength[idx] = max(0, cell_hover_strength[idx] - speed_regulator * 3);
                    }

                    // Dessin de la cellule
                    let color_r = app_meta.color ? hexToRgb(app_meta.color).r : 100;
                    let color_g = app_meta.color ? hexToRgb(app_meta.color).g : 150;
                    let color_b = app_meta.color ? hexToRgb(app_meta.color).b : 255;

                    // Fond de la cellule
                    sketch.fill(color_r * 0.3, color_g * 0.3, color_b * 0.3);
                    sketch.stroke(color_r, color_g, color_b);
                    sketch.strokeWeight(is_hovering ? 3 : 2);
                    sketch.rect(cell_x, cell_y, grid_cell_width - cell_padding * 2, grid_cell_height - cell_padding * 2, 8);

                    // Remplissage au survol avec feedback visuel amélioré
                    if (cell_hover_strength[idx] > 0) {
                        sketch.fill(color_r, color_g, color_b, cell_hover_strength[idx] * 0.7);
                        sketch.noStroke();
                        sketch.rect(cell_x, cell_y, grid_cell_width - cell_padding * 2, grid_cell_height - cell_padding * 2, 8);
                    }

                    // Icône
                    sketch.fill(255);
                    sketch.textSize(48);
                    sketch.text(app_meta.icon || "📱", cell_x, cell_y - 35);

                    // Nom
                    sketch.fill(255);
                    sketch.textSize(18);
                    sketch.text(app_meta.name || app_name, cell_x, cell_y + 15);

                    // Statut "En cours"
                    if (started_apps.includes(app_name)) {
                        sketch.fill(0, 255, 0, 200);
                        sketch.textSize(12);
                        sketch.text("▶ Active", cell_x, cell_y + 35);
                    }

                    // Indicateur de pression visuel
                    if (cell_hover_strength[idx] > 20) {
                        sketch.noFill();
                        sketch.stroke(color_r, color_g, color_b, cell_hover_strength[idx]);
                        sketch.strokeWeight(2);
                        let progress = cell_hover_strength[idx] / 100;
                        sketch.arc(cell_x, cell_y, grid_cell_width - cell_padding * 4, grid_cell_height - cell_padding * 4, 
                                   -PI/2, -PI/2 + TWO_PI * progress, PIE);
                    }

                    // Au clic
                    if (is_hovering && cell_hover_strength[idx] > 95 && cooldown_select <= 0) {
                        click_audio.play();
                        cooldown_select = 50;

                        if (started_apps.includes(app_name)) {
                            sketch.emit("core-app_manager-stop_application", { application_name: app_name });
                        } else {
                            sketch.emit("core-app_manager-start_application", { application_name: app_name });
                        }
                    }
                }
            }
        }
        sketch.pop();

        // Gestion du cooldown
        if (cooldown_select > 0) {
            cooldown_select -= speed_regulator;
        }
    }

    // ========== UTILITAIRES ==========
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 100, g: 150, b: 255 };
    }
});
