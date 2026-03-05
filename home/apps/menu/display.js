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
    let selected_grid_x = 0;
    let selected_grid_y = 0;
    
    // Pour interaction
    let hovered_cell_idx = -1;
    
    // Message de feedback
    let feedback_message = "";
    let feedback_time = 0;
    
    // Écran d'accueil (home screen)
    let show_home_screen = true;
    let inactivity_timeout = 30000; // 30 secondes
    let last_interaction_time = 0;
    let home_button_hover = -1; // -1: aucun, 0: REPRENDRE, 1: DÉMARRER

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

        // Gestion des GIFs (REMPLACÉS PAR TEXTE)
        // open_gif.position(690, 500);
        // close_gif.position(840, 400);
        // document.getElementById("open_gif").style.visibility = "visible";
        // document.getElementById("close_gif").style.visibility = "visible";
        close_gif.hide();
        open_gif.hide();

        // Affichage texte simplifié à la place
        sketch.push();
        sketch.fill(100, 150, 200, 150);
        sketch.textSize(14);
        sketch.textAlign(LEFT);
        sketch.translate(width / 2, height / 2);
        sketch.rotate(PI); // ROTATION 180° pour le texte
        sketch.translate(-width / 2, -height / 2);
        if (!menu_state) {
            sketch.text("Geste: Rapprochez puis écartez les doigts pour ouvrir le menu", 20, height - 30);
        } else {
            sketch.text("Menu ouvert - Sélectionnez un jeu", 20, height - 30);
        }
        sketch.pop();

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
        
        // Vérifier inactivité pour afficher l'écran d'accueil
        if (show_home_screen && !menu_state && !menu_is_opening) {
            draw_home_screen(sketch);
        } else if (!show_home_screen && millis() - last_interaction_time > inactivity_timeout) {
            show_home_screen = true;
            menu_is_closing = true;
            menu_state = false;
        }

        // Affichage du message de feedback - AVEC ROTATION 180°
        if (feedback_message) {
            sketch.push();
            sketch.translate(width / 2, height / 2);
            sketch.rotate(PI);
            sketch.translate(-width / 2, -height / 2);
            sketch.fill(100, 200, 255);
            sketch.textSize(24);
            sketch.textAlign(CENTER, CENTER);
            sketch.text(feedback_message, width / 2, height / 2);
            sketch.pop();
            
            feedback_time--;
            if (feedback_time <= 0) {
                feedback_message = "";
            }
        }

        // Affichage du titre - AVEC ROTATION 180°
        sketch.push();
        sketch.translate(width / 2, height / 2);
        sketch.rotate(PI);
        sketch.translate(-width / 2, -height / 2);
        sketch.translate(width / 2 - 250, -150);
        sketch.fill(255);
        sketch.stroke(255);
        sketch.textSize(50);
        sketch.textAlign(LEFT);
        sketch.text("Interactive Pool", 0, 0);
        sketch.pop();

        // Affichage des FPS - AVEC ROTATION 180°
        sketch.push();
        sketch.translate(width / 2, height / 2);
        sketch.rotate(PI);
        sketch.translate(-width / 2, -height / 2);
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

        // En-tête de menu - SIMPLIFIÉ
        sketch.push();
        sketch.translate(0, -menu_height / 2 + 35);
        sketch.textSize(32);
        sketch.strokeWeight(0);
        sketch.fill(150, 200, 255);
        sketch.textAlign(CENTER, CENTER);
        sketch.text("MENU PRINCIPAL", 0, 0);
        sketch.pop();

        // Barre de catégories (AUGMENTÉE POUR MEILLEURE LISIBILITÉ)
        let category_bar_y = -menu_height / 2 + 80;
        let category_width = menu_width / category_list.length - 15;
        let category_x_start = -menu_width / 2 + 25;
        let category_height = 50; // Augmenté de 35 à 50

        if (category_list.length > 1) {
            sketch.push();
            sketch.translate(0, category_bar_y);
            for (let i = 0; i < category_list.length; i++) {
                let cat_x = category_x_start + (i * (category_width + 15)) + category_width / 2;
                let cat_name = category_list[i];

                // Bouton catégorie - SIMPLIFIÉ
                if (i === current_category) {
                    sketch.fill(100, 150, 255);
                    sketch.stroke(150, 200, 255);
                } else {
                    sketch.fill(40, 60, 100);
                    sketch.stroke(100, 120, 200);
                }
                sketch.strokeWeight(2);
                sketch.rect(cat_x, 0, category_width, category_height, 5);

                sketch.fill(255);
                sketch.textSize(18);
                sketch.textAlign(CENTER, CENTER);
                sketch.text(cat_name, cat_x, 0);
                
                // ✅ DÉTECTION DE CLIC SUR LES CATÉGORIES
                let cat_left = cat_x - category_width / 2;
                let cat_right = cat_x + category_width / 2;
                let cat_top = 0 - category_height / 2;
                let cat_bottom = 0 + category_height / 2;
                
                // Calcul des coordonnées inversées (rotation 180°)
                let inv_x = -index_x_a + menu_position_x * 2;
                let inv_y = -index_y_a + menu_position_y * 2;
                
                let local_x = inv_x - (menu_position_x - menu_width / 2 + 25);
                let local_y = inv_y - (menu_position_y + category_bar_y);
                
                let is_hovering_cat = (local_x > cat_left && local_x < cat_right &&
                                       local_y > cat_top && local_y < cat_bottom);
                
                // Si on détecte un clic sur cette catégorie
                if (is_hovering_cat && index_x_a != 0) {
                    current_category = i; // Change la catégorie
                    // Réinitialise le cooldown pour éviter les clics multiples
                    cooldown_select = 30;
                }
            }
            sketch.pop();
        }

        // Grille d'applications
        let current_apps = categories[category_list[current_category]] || [];
        let grid_start_y = -menu_height / 2 + 160; // Ajusté pour les catégories plus grandes
        let grid_cell_width = (menu_width - 40) / grid_cols;
        let grid_cell_height = (menu_height - 240) / grid_rows;

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

                    // Dessin de la cellule - SIMPLIFIÉ
                    let color_r = 100;
                    let color_g = 150;
                    let color_b = 255;

                    // Fond de la cellule
                    sketch.fill(30, 40, 80);
                    sketch.stroke(color_r, color_g, color_b);
                    sketch.strokeWeight(is_hovering ? 3 : 2);
                    sketch.rect(cell_x, cell_y, grid_cell_width - cell_padding * 2, grid_cell_height - cell_padding * 2, 8);

                    // Remplissage au survol - SIMPLE
                    if (cell_hover_strength[idx] > 0) {
                        sketch.fill(color_r, color_g, color_b, cell_hover_strength[idx] * 0.5);
                        sketch.noStroke();
                        sketch.rect(cell_x, cell_y, grid_cell_width - cell_padding * 2, grid_cell_height - cell_padding * 2, 8);
                    }

                    // Icône
                    sketch.fill(255);
                    sketch.textSize(48);
                    sketch.textAlign(CENTER, CENTER);
                    sketch.text(app_meta.icon || "📱", cell_x, cell_y - 25);

                    // Nom
                    sketch.fill(255);
                    sketch.textSize(16);
                    sketch.textAlign(CENTER, CENTER);
                    sketch.text(app_meta.name || app_name, cell_x, cell_y + 25);

                    // Statut "En cours" - SIMPLIFIÉ
                    if (started_apps.includes(app_name)) {
                        sketch.fill(0, 255, 0);
                        sketch.textSize(11);
                        sketch.text("(Actif)", cell_x, cell_y + 45);
                    }

                    // Au clic - FERMETURE INSTANTANÉE
                    if (is_hovering && cell_hover_strength[idx] > 95 && cooldown_select <= 0) {
                        click_audio.play();
                        cooldown_select = 50;

                        if (started_apps.includes(app_name)) {
                            sketch.emit("core-app_manager-stop_application", { application_name: app_name });
                            feedback_message = `${app_meta.name} arrêté`;
                        } else {
                            sketch.emit("core-app_manager-start_application", { application_name: app_name });
                            feedback_message = `${app_meta.name} lancé! Écartez les mains pour rouvrir`;
                        }
                        feedback_time = 120; // 2 secondes
                        last_interaction_time = millis(); // Reset timer
                        show_home_screen = false;
                        
                        // Fermeture instantanée du menu
                        menu_is_closing = true;
                        menu_state = false;
                        closing_audio.play();
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

    // ========== ÉCRAN D'ACCUEIL ==========
    function draw_home_screen(sketch) {
        sketch.push();
        sketch.translate(width / 2, height / 2);
        sketch.rotate(PI); // Rotation 180°
        sketch.translate(-width / 2, -height / 2);

        // Titre
        sketch.push();
        sketch.fill(100, 200, 255);
        sketch.textSize(48);
        sketch.textAlign(CENTER, CENTER);
        sketch.text("INTERACTIVE POOL", width / 2, height / 4);
        sketch.pop();

        // Bouton REPRENDRE
        let btn_width = 400;
        let btn_height = 100;
        let btn_y_resume = height / 2 - 80;
        let btn_x = width / 2;

        // Détection du survol pour REPRENDRE
        let inv_x = -index_x_a + width / 2 * 2;
        let inv_y = -index_y_a + height / 2 * 2;
        let resume_left = btn_x - btn_width / 2;
        let resume_right = btn_x + btn_width / 2;
        let resume_top = btn_y_resume - btn_height / 2;
        let resume_bottom = btn_y_resume + btn_height / 2;

        let is_hovering_resume = (inv_x > resume_left && inv_x < resume_right &&
                                 inv_y > resume_top && inv_y < resume_bottom);

        // Dessin bouton REPRENDRE
        sketch.fill(is_hovering_resume ? 100 : 50, 150, 200);
        sketch.stroke(150, 200, 255);
        sketch.strokeWeight(is_hovering_resume ? 3 : 2);
        sketch.rect(btn_x, btn_y_resume, btn_width, btn_height, 10);

        sketch.fill(255);
        sketch.textSize(32);
        sketch.textAlign(CENTER, CENTER);
        sketch.text("REPRENDRE JEU", btn_x, btn_y_resume);

        // Clic sur REPRENDRE
        if (is_hovering_resume && index_x_a != 0 && cooldown_select <= 0) {
            click_audio.play();
            cooldown_select = 50;
            show_home_screen = false;
            last_interaction_time = millis();
            feedback_message = "Retour au jeu";
            feedback_time = 60;
        }

        // Bouton DÉMARRER UN AUTRE JEU
        let btn_y_start = height / 2 + 80;

        let start_left = btn_x - btn_width / 2;
        let start_right = btn_x + btn_width / 2;
        let start_top = btn_y_start - btn_height / 2;
        let start_bottom = btn_y_start + btn_height / 2;

        let is_hovering_start = (inv_x > start_left && inv_x < start_right &&
                                inv_y > start_top && inv_y < start_bottom);

        // Dessin bouton DÉMARRER
        sketch.fill(is_hovering_start ? 100 : 50, 150, 200);
        sketch.stroke(150, 200, 255);
        sketch.strokeWeight(is_hovering_start ? 3 : 2);
        sketch.rect(btn_x, btn_y_start, btn_width, btn_height, 10);

        sketch.fill(255);
        sketch.textSize(32);
        sketch.textAlign(CENTER, CENTER);
        sketch.text("DÉMARRER UN AUTRE JEU", btn_x, btn_y_start);

        // Clic sur DÉMARRER
        if (is_hovering_start && index_x_a != 0 && cooldown_select <= 0) {
            click_audio.play();
            cooldown_select = 50;
            show_home_screen = false;
            menu_state = true;
            menu_is_opening = false;
            opening_menu_percentage = 100;
            last_interaction_time = millis();
            feedback_message = "Menu de sélection ouvert";
            feedback_time = 60;
        }

        // Instructions
        sketch.fill(100, 150, 200, 150);
        sketch.textSize(14);
        sketch.textAlign(CENTER);
        sketch.text("Sélectionnez avec votre doigt", width / 2, height - 50);

        sketch.pop();

        // Gestion du cooldown
        if (cooldown_select > 0) {
            cooldown_select -= speed_regulator;
        }
    }
});
