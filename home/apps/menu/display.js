// ============================================================================
// INTERACTIVE POOL - Menu System UX/UI Overhaul v2.0
// ============================================================================
// Écrans: START → SELECT (Category) → DESCRIPTION → Play App
//         Avec: PAUSE (en jeu), IDLE (inactivité), Navigation fluide
// ============================================================================

export const menu = new p5((sketch) => {
    sketch.name = "menu";
    sketch.activated = false;

    // ========== CONSTANTES ET VARIABLES D'ÉTAT ==========
    let font, fontSmall;
    let socket = null;
    
    // États des écrans (SCREEN_STATE)
    const SCREENS = {
        START: 'start',           // Accueil "Interactive Pool"
        SELECT: 'select',         // Sélection app avec catégories
        DESCRIPTION: 'description', // Description de l'app
        PLAYING: 'playing',       // App en cours (invisible, juste pour tracking)
        PAUSE: 'pause',           // Menu pause (en jeu)
        IDLE: 'idle'              // Inactivité > 1 minute
    };

    let current_screen = SCREENS.START;
    let next_screen = null;  // Pour transition douce
    let screen_transition_progress = 0;
    let screen_transition_duration = 300; // ms

    // ========== VARIABLES DE TEMPS ==========
    let last_interaction_time = 0;
    let idle_timeout = 60000;        // 1 minute avant IDLE
    let idle_countdown_max = 30000;  // 30 secondes dans IDLE
    let idle_countdown_start = 0;
    let select_timeout = 120000;     // 2 minutes avant retour START
    let select_inactivity_start = 0;

    // ========== VARIABLES DE GESTES ==========
    let hands_position = [];
    let index_x_a = 0, index_y_a = 0;
    let index_x_b = 0, index_y_b = 0;

    // Détection geste pause (mains écartées horizontalement)
    let pause_gesture_threshold = 300; // pixels entre les doigts
    let pause_gesture_frames = 0;

    // ========== DONNÉES D'APPLICATIONS ==========
    let all_apps = [];
    let app_metadata = {};
    let categories = {};
    let category_list = [];
    let current_category_idx = 0;
    let started_apps = [];

    // ========== VARIABLES DU MENU SELECT ==========
    let grid_cols = 2;
    let grid_rows = 2;
    let cell_hover_times = {};  // Temps de hovering par cellule {idx: time_in_ms}
    let hovered_cell_idx = -1;
    let selected_app_name = null; // App sélectionnée pour DESC
    const PIE_CHART_DURATION = 2000; // 2 secondes

    // ========== VARIABLES ÉCRAN DESCRIPTION ==========
    let app_description_image = null; // placeholder image
    let button_hover_times = {}; // Temps de hovering par bouton

    // ========== RÉFÉRENCES AUDIO/VISUELLES ==========
    let audio_select = new Audio("./home/apps/menu/components/click.mp3");
    let audio_back = new Audio("./home/apps/menu/components/click.mp3");
    let audio_open = new Audio("./home/apps/menu/components/opening_menu.mp3");

    // ========== VARIABLES UTILITY ==========
    let fps = 0;
    let speed_regulator = 1;
    let frame_delta_ms = 16;
    let first_run = true;
    let canvas_width = 0;
    let canvas_height = 0;
    const UI_SCALE = 0.72;
    const INDEX_HOVER_RADIUS = 30;
    const HAND_HOVER_RADIUS = 55;

    // ========== PRELOAD ==========
    sketch.preload = () => {
        font = loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");
        
        // Charger config
        let url = getURLPath();
        url.splice(-1);
        url = url.join("/");
        loadJSON("/" + url + "/platform/home/config.json", (data) => {
            if (data.applications.menu_control) {
                all_apps = data.applications.menu_control;
            }
            if (data.app_metadata) {
                app_metadata = data.app_metadata;
                organizeByCategories();
            }
        });
    };

    // ========== SETUP ==========
    sketch.set = (width, height, sock) => {
        canvas_width = width;
        canvas_height = height;

        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);

        centerCanvas();

        sketch.activated = true;
        socket = sock;

        // Recevoir position des mains
        socket.on(sketch.name, (data) => {
            if (data && data.hands_landmarks && data.hands_landmarks.length > 0) {
                hands_position = data.hands_landmarks;
                last_interaction_time = millis();
            }
        });

        // Emit custom events
        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };

        // Suivre les apps lancées
        socket.on("core-app_manager-started_applications", async (data) => {
            started_apps = data.applications.map(app => app.name);
            if (started_apps.includes(selected_app_name)) {
                current_screen = SCREENS.PLAYING;
                setupPauseGestureDetection();
            }
        });
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {};
    sketch.windowResized = () => {
        centerCanvas();
    };

    // ========== MAIN DRAW LOOP ==========
    sketch.show = () => {
        if (first_run) {
            first_run = false;
            last_interaction_time = millis();
        }

        fps = Math.round(frameRate());
        speed_regulator = 50 / fps;
        frame_delta_ms = sketch.deltaTime || (1000 / Math.max(fps, 1));

        sketch.clear();
        sketch.fill(255);
        sketch.stroke(255);
        sketch.textFont(font);

        // Mise à jour du timing
        updateTimings();

        // Gestion des gestes de pause (si app en cours)
        if (current_screen === SCREENS.PLAYING) {
            checkPauseGesture();
        }

        // Déterminer l'écran à afficher
        determineScreen();

        // Afficher l'écran avec transition douce
        sketch.push();
        sketch.scale(UI_SCALE);
        drawScreenWithTransition();
        sketch.pop();

        // Debug info
        drawDebugInfo();
    };

    // ========== GESTION D'ÉTAT DES ÉCRANS ==========
    function determineScreen() {
        const now = millis();
        const timeSinceInteraction = now - last_interaction_time;

        // Si en train de jouer et inactivité > 1 min => IDLE
        if (current_screen === SCREENS.PLAYING && timeSinceInteraction > idle_timeout) {
            current_screen = SCREENS.IDLE;
            idle_countdown_start = now;
        }

        // Si dans SELECT et inactivité > 2 min => START
        if (current_screen === SCREENS.SELECT && timeSinceInteraction > select_timeout) {
            goToScreen(SCREENS.START);
            select_inactivity_start = 0; // Reset pour la prochaine visite
        }

        // Si dans IDLE et countdown écoulé => START
        if (current_screen === SCREENS.IDLE) {
            const timeInIdle = now - idle_countdown_start;
            if (timeInIdle > idle_countdown_max) {
                goToScreen(SCREENS.START);
            }
        }

        // Si retour du SELECT après description => revenir à SELECT
        // (géré dans les fonctions d'interaction)
    }

    function goToScreen(screenName) {
        if (current_screen !== screenName) {
            next_screen = screenName;
            screen_transition_progress = 0;
        }
    }

    function drawScreenWithTransition() {
        // Pas de transition pour l'instant, affichage direct
        if (next_screen && screen_transition_progress < 100) {
            screen_transition_progress += (frame_delta_ms / screen_transition_duration) * 100;
        }

        if (screen_transition_progress >= 100 && next_screen) {
            current_screen = next_screen;
            next_screen = null;
            screen_transition_progress = 0;
        }

        // Appeler la fonction de rendu appropriée
        switch (current_screen) {
            case SCREENS.START:
                drawStartScreen();
                break;
            case SCREENS.SELECT:
                drawSelectScreen();
                break;
            case SCREENS.DESCRIPTION:
                drawDescriptionScreen();
                break;
            case SCREENS.PLAYING:
                // Rien à afficher, app joue
                break;
            case SCREENS.PAUSE:
                drawPauseMenu();
                break;
            case SCREENS.IDLE:
                drawIdleScreen();
                break;
        }
    }

    // ========== ÉCRAN 1: START ==========
    function drawStartScreen() {
        sketch.push();
        sketch.fill(20, 30, 50); // Fond sombre
        sketch.rect(-width/2, -height/2, width, height);
        sketch.pop();

        // Titre "Interactive Pool"
        sketch.push();
        sketch.fill(255);
        sketch.textAlign(CENTER, CENTER);
        sketch.textSize(80);
        sketch.text("Interactive Pool", 0, -100);
        sketch.pop();

        // Bouton START
        drawButton(0, 100, 250, 80, "START", () => {
            goToScreen(SCREENS.SELECT);
            select_inactivity_start = millis();
            last_interaction_time = millis();
            audio_open.play();
        }, "btn_start");

        // Instructions
        sketch.push();
        sketch.fill(150);
        sketch.textAlign(CENTER);
        sketch.textSize(18);
        sketch.text("Passez votre main au-dessus du bouton START pour continuer", 0, height/2 - 50);
        sketch.pop();
    }

    // ========== ÉCRAN 2: SELECT (Catégories + Grille) ==========
    function drawSelectScreen() {
        sketch.push();
        sketch.fill(30, 40, 60); // Fond
        sketch.rect(-width/2, -height/2, width, height);
        sketch.pop();

        // Bannière catégories en haut
        drawCategoryBanner();

        // Grille 2x2 d'apps
        drawAppGrid();

        // Info inactivité
        const timeSinceInteraction = millis() - select_inactivity_start;
        const timeRemaining = max(0, select_timeout - timeSinceInteraction);
        if (timeRemaining < 30000) { // Afficher si < 30s
            sketch.push();
            sketch.fill(255, 100, 100);
            sketch.textAlign(CENTER);
            sketch.textSize(16);
            sketch.text(`Retour à l'accueil dans ${Math.ceil(timeRemaining / 1000)}s`, 0, height/2 - 20);
            sketch.pop();
        }
    }

    function drawCategoryBanner() {
        const banner_height = 80;
        const banner_y = -height/2 + banner_height/2;

        sketch.push();
        sketch.fill(50, 70, 100);
        sketch.rect(-width/2, banner_y - banner_height/2, width, banner_height);
        sketch.pop();

        // Titre catégorie
        const current_cat = category_list[current_category_idx] || "Tous";
        sketch.push();
        sketch.fill(200, 220, 255);
        sketch.textAlign(CENTER);
        sketch.textSize(24);
        sketch.text(`Catégorie: ${current_cat}`, 0, banner_y - 15);
        sketch.pop();

        // Boutons navigation catégories (gauche/droite)
        const btn_size = 50;
        const left_btn_x = -width/2 + 60;
        const right_btn_x = width/2 - 60;

        drawButton(left_btn_x, banner_y, btn_size, btn_size, "◀", () => {
            current_category_idx = max(0, current_category_idx - 1);
            audio_select.play();
        }, "btn_cat_left");

        drawButton(right_btn_x, banner_y, btn_size, btn_size, "▶", () => {
            current_category_idx = min(category_list.length - 1, current_category_idx + 1);
            audio_select.play();
        }, "btn_cat_right");
    }

    function drawAppGrid() {
        const grid_start_y = -height/2 + 150;
        const grid_margin = 40;
        const available_width = width - (grid_margin * 2);
        const available_height = height - 250;

        const cell_width = available_width / grid_cols;
        const cell_height = available_height / grid_rows;

        const current_cat = category_list[current_category_idx] || "Tous";
        const apps_in_category = categories[current_cat] || [];

        // Afficher jusqu'à 4 apps (2x2)
        for (let row = 0; row < grid_rows; row++) {
            for (let col = 0; col < grid_cols; col++) {
                const idx = row * grid_cols + col;
                if (idx >= apps_in_category.length) break;

                const app_name = apps_in_category[idx];
                const app_meta = app_metadata[app_name] || { name: app_name };
                const is_running = started_apps.includes(app_name);

                // Position de la cellule
                const cell_x = -width/2 + grid_margin + col * cell_width + cell_width/2;
                const cell_y = grid_start_y + row * cell_height + cell_height/2;

                // Détection du survol
                const is_hovering = checkPointHover(cell_x - cell_width/2, cell_y - cell_height/2, 
                                                   cell_width, cell_height);

                // Accumuler le temps de hovering
                const cell_key = `cell_${idx}`;
                if (is_hovering) {
                    if (!cell_hover_times[cell_key]) cell_hover_times[cell_key] = 0;
                    cell_hover_times[cell_key] += frame_delta_ms;
                    hovered_cell_idx = idx;
                } else {
                    cell_hover_times[cell_key] = 0;
                }

                // Rendre la cellule
                const hover_time = cell_hover_times[cell_key] || 0;
                drawAppCell(cell_x, cell_y, cell_width, cell_height, app_meta, 
                           is_running, is_hovering, hover_time, idx, app_name);
            }
        }
    }

    function drawAppCell(x, y, w, h, app_meta, is_running, is_hovering, hover_time, idx, app_name) {
        const padding = 10;
        const inner_w = w - padding * 2;
        const inner_h = h - padding * 2;
        const inner_x = x - inner_w/2;
        const inner_y = y - inner_h/2;

        // Fond de la cellule
        sketch.push();
        if (is_hovering) {
            sketch.fill(70, 100, 140);
        } else {
            sketch.fill(50, 70, 100);
        }
        if (is_running) {
            sketch.stroke(100, 200, 100);
        } else {
            sketch.stroke(150, 150, 150);
        }
        sketch.strokeWeight(2);
        sketch.rectMode(CORNER);
        sketch.rect(inner_x, inner_y, inner_w, inner_h, 10);
        sketch.pop();

        // Icône et texte
        sketch.push();
        sketch.fill(255);
        sketch.textAlign(CENTER, CENTER);
        sketch.textSize(20);
        sketch.text(app_meta.icon || "📱", x, y - 15);
        sketch.textSize(14);
        sketch.text(app_meta.name || app_name, x, y + 20);
        if (is_running) {
            sketch.fill(100, 200, 100);
            sketch.text("(Actif)", x, y + 40);
        }
        sketch.pop();

        // Camembert si hovering
        if (is_hovering && hover_time > 0) {
            drawPieChart(x, y, 40, hover_time, PIE_CHART_DURATION);
        }

        // Sélection complète au camembert complet
        if (hover_time >= PIE_CHART_DURATION) {
            selectApp(app_name);
            cell_hover_times[`cell_${idx}`] = 0; // Reset
        }
    }

    function drawPieChart(x, y, radius, time, duration) {
        const progress = min(1, time / duration);
        const angle = progress * TWO_PI - PI/2; // Commence de haut

        sketch.push();
        sketch.fill(100, 200, 100, 150);
        sketch.stroke(100, 255, 100);
        sketch.strokeWeight(2);
        sketch.arc(x, y, radius * 2, radius * 2, -PI/2, angle, PIE);
        sketch.pop();
    }

    // ========== ÉCRAN 3: DESCRIPTION ==========
    function drawDescriptionScreen() {
        sketch.push();
        sketch.fill(30, 40, 60);
        sketch.rect(-width/2, -height/2, width, height);
        sketch.pop();

        if (!selected_app_name) return;

        const app_meta = app_metadata[selected_app_name] || {};
        const margin = 40;
        const left_section_width = width/2 - margin * 2;
        const left_x = -width/4 - margin;

        // Section gauche: Titre + Description
        sketch.push();
        sketch.fill(255);
        sketch.textAlign(LEFT, TOP);
        sketch.textSize(32);
        sketch.text(app_meta.name || selected_app_name, left_x, -height/2 + margin);

        sketch.textSize(14);
        sketch.fill(200);
        const desc = app_meta.description || "Aucune description";
        const max_chars = 60;
        let y = -height/2 + margin + 60;
        const words = desc.split(" ");
        let line = "";
        for (let word of words) {
            if ((line + word).length > max_chars) {
                sketch.text(line, left_x, y);
                y += 20;
                line = word + " ";
            } else {
                line += word + " ";
            }
        }
        sketch.text(line, left_x, y);
        sketch.pop();

        // Section droite: Image placeholder
        sketch.push();
        sketch.fill(100, 130, 170);
        sketch.rect(width/4 - 100, -height/2 + margin, 200, 200, 10);
        sketch.fill(255);
        sketch.textAlign(CENTER, CENTER);
        sketch.textSize(48);
        sketch.text(app_meta.icon || "📦", width/4, -height/2 + margin + 100);
        sketch.pop();

        // Boutons en bas
        const btn_y = height/2 - 80;
        const btn_back_x = -width/4;
        const btn_play_x = width/4;

        drawButton(btn_back_x, btn_y, 200, 60, "◄ Retour", () => {
            goToScreen(SCREENS.SELECT);
            audio_back.play();
        }, "btn_desc_back");

        drawButton(btn_play_x, btn_y, 200, 60, "Play ►", () => {
            audio_select.play();
            sketch.emit("core-app_manager-start_application", { 
                application_name: selected_app_name 
            });
            current_screen = SCREENS.PLAYING;
            setupPauseGestureDetection();
        }, "btn_desc_play");
    }

    // ========== ÉCRAN 4: MENU PAUSE ==========
    function drawPauseMenu() {
        // Fond semi-transparent
        sketch.push();
        sketch.fill(0, 0, 0, 150);
        sketch.rect(-width/2, -height/2, width, height);
        sketch.pop();

        // Panneau du menu pause
        const panel_width = 400;
        const panel_height = 350;
        sketch.push();
        sketch.fill(30, 40, 60);
        sketch.rect(-panel_width/2, -panel_height/2, panel_width, panel_height, 15);
        sketch.pop();

        // Titre
        sketch.push();
        sketch.fill(200, 220, 255);
        sketch.textAlign(CENTER);
        sketch.textSize(32);
        sketch.text("== PAUSE ==", 0, -100);
        sketch.pop();

        // Boutons
        drawButton(0, -30, 220, 50, "Reprendre", () => {
            current_screen = SCREENS.PLAYING;
            audio_select.play();
        }, "btn_pause_resume");

        drawButton(0, 40, 220, 50, "Redémarrer", () => {
            sketch.emit("core-app_manager-stop_application", { 
                application_name: selected_app_name 
            });
            sketch.emit("core-app_manager-start_application", { 
                application_name: selected_app_name 
            });
            current_screen = SCREENS.PLAYING;
            audio_select.play();
        }, "btn_pause_restart");

        drawButton(0, 110, 220, 50, "Menu", () => {
            sketch.emit("core-app_manager-stop_application", { 
                application_name: selected_app_name 
            });
            goToScreen(SCREENS.SELECT);
            audio_back.play();
        }, "btn_pause_menu");
    }

    // ========== ÉCRAN 5: IDLE ==========
    function drawIdleScreen() {
        sketch.push();
        sketch.fill(30, 40, 60);
        sketch.rect(-width/2, -height/2, width, height);
        sketch.pop();

        // Message
        sketch.push();
        sketch.fill(255);
        sketch.textAlign(CENTER);
        sketch.textSize(48);
        sketch.text("Êtes-vous toujours là ?", 0, -150);
        sketch.pop();

        // Boutons
        drawButton(-150, 0, 220, 60, "Continuer", () => {
            current_screen = SCREENS.PLAYING;
            last_interaction_time = millis();
            audio_select.play();
        }, "btn_idle_continue");

        drawButton(150, 0, 220, 60, "Retour Menu", () => {
            goToScreen(SCREENS.SELECT);
            last_interaction_time = millis();
            audio_back.play();
        }, "btn_idle_menu");

        // Compte à rebours
        const time_in_idle = millis() - idle_countdown_start;
        const time_remaining = max(0, idle_countdown_max - time_in_idle);
        const seconds = Math.ceil(time_remaining / 1000);

        sketch.push();
        sketch.fill(255, 150, 150);
        sketch.textAlign(CENTER);
        sketch.textSize(32);
        sketch.text(`Retour à l'accueil dans ${seconds}s`, 0, 150);
        sketch.pop();
    }

    // ========== COMPOSANTS RÉUTILISABLES ==========
    function drawButton(x, y, w, h, label, callback, button_id) {
        button_id = button_id || `btn_${x}_${y}`;
        const is_hovering = checkPointHover(x - w/2, y - h/2, w, h);

        sketch.push();
        if (is_hovering) {
            sketch.fill(100, 150, 200);
        } else {
            sketch.fill(70, 110, 160);
        }
        sketch.stroke(200, 220, 255);
        sketch.strokeWeight(2);
        sketch.rectMode(CENTER);
        sketch.rect(x, y, w, h, 8);
        sketch.pop();

        sketch.push();
        sketch.fill(255);
        sketch.textAlign(CENTER, CENTER);
        sketch.textSize(18);
        sketch.text(label, x, y);
        sketch.pop();

        // Sélection avec camembert si hovering
        if (is_hovering) {
            if (!button_hover_times[button_id]) button_hover_times[button_id] = 0;
            button_hover_times[button_id] += frame_delta_ms;
            
            const hover_time = button_hover_times[button_id];
            drawPieChart(x + w/2 - 25, y - h/2 + 15, 20, hover_time, PIE_CHART_DURATION);

            if (hover_time >= PIE_CHART_DURATION) {
                callback();
                button_hover_times[button_id] = 0; // Reset
            }
        } else {
            button_hover_times[button_id] = 0; // Reset si pas hovering
        }
    }

    function checkPointHover(rect_x, rect_y, rect_w, rect_h) {
        if (hands_position.length === 0) return false;

        // Itérer sur toutes les mains détectées
        for (let hand of hands_position) {
            if (!hand || hand.length < 21) continue;

            // Utiliser l'index (doigt pointeur) de la main
            // Les coordonnées sont normalisées (0-1)
            let index_x = hand[8][0] * width;
            let index_y = hand[8][1] * height;

            // Convertir pour le système de coordonnées WEBGL (-width/2 à width/2)
            index_x = index_x - width/2;
            index_y = index_y - height/2;

            // Le rendu UI est réduit via scale(UI_SCALE), on remonte en coordonnées UI logiques.
            index_x = index_x / UI_SCALE;
            index_y = index_y / UI_SCALE;

            // Priorité absolue: index dans le rectangle
            if (index_x > rect_x && index_x < rect_x + rect_w &&
                index_y > rect_y && index_y < rect_y + rect_h) {
                return true;
            }

            // Tolérance autour de l'index (hitbox plus large)
            if (index_x > rect_x - INDEX_HOVER_RADIUS && index_x < rect_x + rect_w + INDEX_HOVER_RADIUS &&
                index_y > rect_y - INDEX_HOVER_RADIUS && index_y < rect_y + rect_h + INDEX_HOVER_RADIUS) {
                return true;
            }

            // Fallback main: centre de paume pour compenser les tremblements/occlusions
            let palm_x = hand[0][0] * width;
            let palm_y = hand[0][1] * height;
            
            // Convertir pour le système de coordonnées WEBGL (-width/2 à width/2)
            palm_x = palm_x - width/2;
            palm_y = palm_y - height/2;

            // Conversion vers le même repère logique que les éléments UI dessinés.
            palm_x = palm_x / UI_SCALE;
            palm_y = palm_y / UI_SCALE;

            if (palm_x > rect_x - HAND_HOVER_RADIUS && palm_x < rect_x + rect_w + HAND_HOVER_RADIUS &&
                palm_y > rect_y - HAND_HOVER_RADIUS && palm_y < rect_y + rect_h + HAND_HOVER_RADIUS) {
                return true;
            }
        }

        return false; // Aucune main n'est au-dessus
    }

    // ========== GESTION DES GESTES ==========
    function checkPauseGesture() {
        if (hands_position.length < 2) return;

        // Coordonnées des deux index
        const hand1_x = hands_position[0][8][0] * width;
        const hand1_y = hands_position[0][8][1] * height;
        const hand2_x = hands_position[1][8][0] * width;
        const hand2_y = hands_position[1][8][1] * height;
        
        const horizontal_distance = Math.abs(hand1_x - hand2_x);
        const vertical_distance = Math.abs(hand1_y - hand2_y);

        // Si les mains sont écartées horizontalement (> 300px)
        // ET verticalement proches (< 150px)
        if (horizontal_distance > pause_gesture_threshold && vertical_distance < 150) {
            pause_gesture_frames++;
            if (pause_gesture_frames > 15) { // ~0.25s à 60fps
                current_screen = SCREENS.PAUSE;
                pause_gesture_frames = 0;
            }
        } else {
            pause_gesture_frames = 0;
        }
    }

    // ========== UTILITAIRES ==========
    function organizeByCategories() {
        categories = {};
        for (let app of all_apps) {
            if (app_metadata[app]) {
                const cat = app_metadata[app].category || "Autres";
                if (!categories[cat]) {
                    categories[cat] = [];
                }
                categories[cat].push(app);
            }
        }
        category_list = Object.keys(categories).sort();
        if (category_list.length === 0) {
            category_list = ["Tous"];
            categories["Tous"] = all_apps;
        }
    }

    function selectApp(app_name) {
        selected_app_name = app_name;
        goToScreen(SCREENS.DESCRIPTION);
        audio_select.play();
    }

    function updateTimings() {
        // Mettre à jour le timer d'inactivité du menu SELECT
        if (current_screen === SCREENS.SELECT) {
            const now = millis();
            // Si une interaction a eu lieu, on reset le timer
            if (now - last_interaction_time < 100) {
                select_inactivity_start = now;
            }
        }
    }

    function setupPauseGestureDetection() {
        pause_gesture_frames = 0;
    }

    function centerCanvas() {
        if (!sketch.selfCanvas) return;

        const x = Math.max(0, Math.floor((windowWidth - canvas_width) / 2));
        const y = Math.max(0, Math.floor((windowHeight - canvas_height) / 2));

        sketch.selfCanvas.position(x, y);
    }

    function drawDebugInfo() {
        // Info de debug optionnel
        if (false) { // Mettre à true pour debug
            sketch.push();
            sketch.fill(100);
            sketch.textSize(12);
            sketch.textAlign(LEFT);
            sketch.text(`Screen: ${current_screen}`, -width/2 + 10, -height/2 + 20);
            sketch.text(`Hands: ${hands_position.length}`, -width/2 + 10, -height/2 + 40);
            sketch.text(`Time since interaction: ${millis() - last_interaction_time}ms`, -width/2 + 10, -height/2 + 60);
            sketch.pop();
        }
    }
});
