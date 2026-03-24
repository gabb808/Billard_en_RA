// ============================================================================
// INTERACTIVE POOL - Menu System v2.1
// ============================================================================
// Changements v2.1 :
//  - Rendu purement 2D (suppression WebGL/OPENGL → plus de bugs de profondeur)
//  - Police Rajdhani (display) + Exo 2 (body) chargées via p5.loadFont fallback
//  - Boutons redesignés : bordure franche, fond sombre, lettrages espacés
//  - Grille apps : icônes initiales colorées, catégorie visible, hover animé
//  - Écran Description : panneau gauche texte / panneau droit bouton JOUER
//  - Palette cohérente : bleu nuit #080d18 + accents #3a8fff + typo #d8eaff
// ============================================================================

export const menu = new p5((sketch) => {
    sketch.name = "menu";
    sketch.activated = false;

    // ─── CONSTANTES ÉCRANS ───────────────────────────────────────────────────
    const SCREENS = {
        START: 'start',
        SELECT: 'select',
        DESCRIPTION: 'description',
        PLAYING: 'playing',
        PAUSE: 'pause',
        IDLE: 'idle'
    };

    let current_screen = SCREENS.START;
    let next_screen = null;
    let screen_transition_progress = 0;
    const SCREEN_TRANSITION_DURATION = 260;

    // ─── TEMPS / INACTIVITÉ ──────────────────────────────────────────────────
    let last_interaction_time = 0;
    const IDLE_TIMEOUT        = 60000;
    const IDLE_COUNTDOWN_MAX  = 30000;
    let   idle_countdown_start = 0;
    const SELECT_TIMEOUT      = 120000;
    let   select_inactivity_start = 0;

    // ─── MAINS ───────────────────────────────────────────────────────────────
    let hands_position = [];
    let pause_gesture_frames = 0;
    const PAUSE_GESTURE_THRESHOLD = 300;

    // ─── DONNÉES APPS ────────────────────────────────────────────────────────
    let all_apps      = [];
    let app_metadata  = {};
    let categories    = {};
    let category_list = [];
    let current_category_idx = 0;
    let started_apps  = [];

    // ─── HOVER / SÉLECTION ───────────────────────────────────────────────────
    const GRID_COLS          = 2;
    const GRID_ROWS          = 2;
    let cell_hover_times     = {};
    let button_hover_times   = {};
    let selected_app_name    = null;
    const PIE_DURATION       = 2000; // ms pour valider

    // ─── AUDIO ───────────────────────────────────────────────────────────────
    let audio_select  = new Audio("./home/apps/menu/components/click.mp3");
    let audio_back    = new Audio("./home/apps/menu/components/click.mp3");
    let audio_open    = new Audio("./home/apps/menu/components/opening_menu.mp3");

    // ─── UTILS LAYOUT ────────────────────────────────────────────────────────
    let socket         = null;
    let fps            = 0;
    let frame_delta_ms = 16;
    let first_run      = true;
    let canvas_width   = 0;
    let canvas_height  = 0;

    // Facteur de mise à l'échelle de la projection
    const UI_SCALE          = 0.62;
    const MENU_ROTATE_180   = true;
    const BUTTON_PAD        = 18;
    const CELL_PAD          = 14;
    const INDEX_HOVER_RADIUS = 44;
    const CURSOR_R           = 8;

    // ─── PALETTE ─────────────────────────────────────────────────────────────
    const C = {
        bg_deep:   [8,  13, 24],
        bg_mid:    [13, 22, 40],
        bg_panel:  [10, 18, 34],
        bg_hover:  [20, 36, 72],
        border:    [26, 48, 96],
        border_hi: [48, 96, 160],
        accent:    [58, 143, 255],
        accent2:   [100, 180, 255],
        text_hi:   [216, 234, 255],
        text_mid:  [112, 148, 192],
        text_dim:  [48,  80, 128],
        green_i:   [60, 200, 110],
        // Couleurs icônes
        pink:      [200, 60, 120],  pink_bg:  [60, 10, 38],
        blue_i:    [80, 150, 240],  blue_bg:  [12, 35, 90],
        green_fg:  [60, 200, 110],  green_bg: [10, 55, 28],
        amber_i:   [240, 165, 50],  amber_bg: [72, 46, 6],
        teal_i:    [50, 210, 190],  teal_bg:  [6,  62, 70],
    };

    // Map couleur par nom d'app
    const APP_COLOR_KEYS = {
        rabbits_game:               { fg: C.pink,    bg: C.pink_bg  },
        affine:                     { fg: C.blue_i,  bg: C.blue_bg  },
        triangles_remarkable_lines: { fg: C.green_fg,bg: C.green_bg },
        triangles_full_lesson:      { fg: C.amber_i, bg: C.amber_bg },
        triangles_short_lesson:     { fg: C.teal_i,  bg: C.teal_bg  },
    };

    // ─── POLICE ──────────────────────────────────────────────────────────────
    let font_display = null;
    let font_body    = null;
    const FONT_PATH  = "/gosai/pool/core/server/assets/FallingSky-JKwK.otf";

    // ─── PRELOAD ─────────────────────────────────────────────────────────────
    sketch.preload = () => {
        font_display = loadFont(FONT_PATH, () => {}, () => {
            console.warn("[menu] Font not loaded, using system fallback");
        });
        font_body = font_display;

        let url = getURLPath();
        url.splice(-1);
        url = url.join("/");
        loadJSON("/" + url + "/platform/home/config.json", (data) => {
            if (data.applications && data.applications.menu_control) {
                all_apps = data.applications.menu_control;
            }
            if (data.app_metadata) {
                app_metadata = data.app_metadata;
                organizeByCategories();
            }
        });
    };

    // ─── SETUP ───────────────────────────────────────────────────────────────
    sketch.set = (width, height, sock) => {
        canvas_width  = width;
        canvas_height = height;
        socket        = sock;

        // *** P2D au lieu de WEBGL → supprime tous les problèmes de depth/alpha ***
        sketch.selfCanvas = sketch
            .createCanvas(width, height)   // P2D par défaut
            .position(0, 0);

        sketch.activated = true;

        socket.on(sketch.name, (data) => {
            hands_position = (data && data.hands_landmarks) ? data.hands_landmarks : [];
            if (hands_position.length > 0) {
                last_interaction_time = millis();
            }
        });

        sketch.emit = (name, data) => socket.emit(name, data);

        socket.on("core-app_manager-started_applications", (data) => {
            started_apps = data.applications.map(a => a.name);
            if (selected_app_name && started_apps.includes(selected_app_name)) {
                current_screen = SCREENS.PLAYING;
                pause_gesture_frames = 0;
            }
        });
    };

    sketch.resume      = () => {};
    sketch.pause       = () => {};
    sketch.update      = () => {};
    sketch.windowResized = () => {
        if (sketch.selfCanvas) sketch.selfCanvas.position(0, 0);
    };

    // ─── BOUCLE PRINCIPALE ───────────────────────────────────────────────────
    sketch.show = () => {
        if (first_run) {
            first_run = false;
            last_interaction_time = millis();
        }

        fps            = Math.round(frameRate());
        frame_delta_ms = sketch.deltaTime || (1000 / Math.max(fps, 1));

        // Fond opaque (P2D : simple, pas de tricks WEBGL)
        setFill(C.bg_deep);
        sketch.noStroke();
        sketch.rect(0, 0, canvas_width, canvas_height);

        updateTimings();

        if (current_screen === SCREENS.PLAYING) {
            checkPauseGesture();
        }

        determineScreen();

        sketch.push();
        sketch.translate(canvas_width / 2, canvas_height / 2);
        sketch.scale(UI_SCALE);
        if (MENU_ROTATE_180) sketch.rotate(PI);

        drawScreenWithTransition();
        drawCursor();
        sketch.pop();
    };

    // ─── HELPERS COULEUR & TEXTE ─────────────────────────────────────────────
    function setFill(c, alpha) {
        if (alpha !== undefined) sketch.fill(c[0], c[1], c[2], alpha);
        else sketch.fill(c[0], c[1], c[2]);
    }

    function setStroke(c, alpha) {
        if (alpha !== undefined) sketch.stroke(c[0], c[1], c[2], alpha);
        else sketch.stroke(c[0], c[1], c[2]);
    }

    function useDisplayFont(size) {
        if (font_display) sketch.textFont(font_display);
        sketch.textSize(size);
    }

    function useBodyFont(size) {
        if (font_body) sketch.textFont(font_body);
        sketch.textSize(size);
    }

    function drawWrappedText(txt, x, y, maxW, leading) {
        const words = (txt || "").split(/\s+/);
        let line = "", cy = y;
        for (const w of words) {
            const cand = line ? `${line} ${w}` : w;
            if (sketch.textWidth(cand) > maxW && line) {
                sketch.text(line, x, cy);
                line = w;
                cy += leading;
            } else {
                line = cand;
            }
        }
        if (line) sketch.text(line, x, cy);
    }

    function solidBg(r, g, b) {
        sketch.push();
        sketch.noStroke();
        sketch.fill(r, g, b);
        const W = canvas_width  / UI_SCALE + 20;
        const H = canvas_height / UI_SCALE + 20;
        sketch.rectMode(CENTER);
        sketch.rect(0, 0, W, H);
        sketch.pop();
    }

    function drawBgGrid() {
        sketch.push();
        setStroke(C.border, 28);
        sketch.strokeWeight(1);
        const W = canvas_width  / UI_SCALE;
        const H = canvas_height / UI_SCALE;
        const step = 40;
        for (let x = -W/2; x < W/2; x += step) sketch.line(x, -H/2, x, H/2);
        for (let y = -H/2; y < H/2; y += step) sketch.line(-W/2, y, W/2, y);
        sketch.pop();
    }

    function drawCorner(cx, cy, sz, top, bottom, left, right) {
        sketch.push();
        setStroke(C.border);
        sketch.strokeWeight(1.5);
        sketch.noFill();
        if (top   && left)  { sketch.line(cx, cy, cx+sz, cy); sketch.line(cx, cy, cx, cy+sz); }
        if (top   && right) { sketch.line(cx, cy, cx-sz, cy); sketch.line(cx, cy, cx, cy+sz); }
        if (bottom && left) { sketch.line(cx, cy, cx+sz, cy); sketch.line(cx, cy, cx, cy-sz); }
        if (bottom && right){ sketch.line(cx, cy, cx-sz, cy); sketch.line(cx, cy, cx, cy-sz); }
        sketch.pop();
    }

    // ─── GESTION D'ÉTAT ──────────────────────────────────────────────────────
    function determineScreen() {
        const now  = millis();
        const idle = now - last_interaction_time;

        if (current_screen === SCREENS.PLAYING && idle > IDLE_TIMEOUT) {
            setScreenImmediate(SCREENS.IDLE);
            idle_countdown_start = now;
        }
        if (current_screen === SCREENS.SELECT && idle > SELECT_TIMEOUT) {
            goToScreen(SCREENS.START);
        }
        if (current_screen === SCREENS.IDLE) {
            if (now - idle_countdown_start > IDLE_COUNTDOWN_MAX) {
                stopSelectedApp();
                setScreenImmediate(SCREENS.START);
                last_interaction_time = now;
            }
        }
    }

    function goToScreen(s) {
        if (current_screen !== s) { next_screen = s; screen_transition_progress = 0; }
    }

    function setScreenImmediate(s) {
        current_screen = s; next_screen = null; screen_transition_progress = 0;
    }

    function stopSelectedApp() {
        if (!selected_app_name || !started_apps.includes(selected_app_name)) return;
        sketch.emit("core-app_manager-stop_application", { application_name: selected_app_name });
        started_apps = started_apps.filter(n => n !== selected_app_name);
    }

    function drawScreenWithTransition() {
        if (next_screen) {
            screen_transition_progress += (frame_delta_ms / SCREEN_TRANSITION_DURATION) * 100;
            if (screen_transition_progress >= 100) {
                current_screen = next_screen;
                next_screen = null;
                screen_transition_progress = 0;
            }
        }
        switch (current_screen) {
            case SCREENS.START:       drawStartScreen(); break;
            case SCREENS.SELECT:      drawSelectScreen(); break;
            case SCREENS.DESCRIPTION: drawDescriptionScreen(); break;
            case SCREENS.PLAYING:     break;
            case SCREENS.PAUSE:       drawPauseMenu(); break;
            case SCREENS.IDLE:        drawIdleScreen(); break;
        }
    }

    // ─── ÉCRAN 1 : START ─────────────────────────────────────────────────────
    function drawStartScreen() {
        solidBg(...C.bg_deep);
        drawBgGrid();

        const W = canvas_width  / UI_SCALE;
        const H = canvas_height / UI_SCALE;
        const margin = 28;
        drawCorner(-W/2+margin, -H/2+margin, 28, true,  false, true,  false);
        drawCorner( W/2-margin, -H/2+margin, 28, true,  false, false, true);
        drawCorner(-W/2+margin,  H/2-margin, 28, false, true,  true,  false);
        drawCorner( W/2-margin,  H/2-margin, 28, false, true,  false, true);

        sketch.push();
        useBodyFont(13);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_dim);
        sketch.text("DVIC — IFT", 0, -160);
        sketch.pop();

        sketch.push();
        useDisplayFont(76);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_hi);
        sketch.text("INTERACTIVE", 0, -90);
        setFill(C.accent);
        sketch.text("POOL", 0, -2);
        sketch.pop();

        sketch.push();
        useBodyFont(13);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_dim);
        sketch.text("PLATEFORME TANGIBLE AUGMENTÉE", 0, 56);
        sketch.pop();

        drawButton(0, 140, 300, 68, "DÉMARRER", () => {
            goToScreen(SCREENS.SELECT);
            select_inactivity_start = millis();
            last_interaction_time   = millis();
            audio_open.play();
        }, "btn_start", true);

        sketch.push();
        useBodyFont(12);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_dim);
        sketch.text("Maintenez votre main au-dessus du bouton", 0, H/2 - 48);
        sketch.pop();
    }

    // ─── ÉCRAN 2 : SÉLECTION ─────────────────────────────────────────────────
    function drawSelectScreen() {
        solidBg(...C.bg_deep);
        drawBgGrid();
        drawCategoryBanner();
        drawAppGrid();

        const elapsed   = millis() - select_inactivity_start;
        const remaining = Math.max(0, SELECT_TIMEOUT - elapsed);
        if (remaining < 30000) {
            sketch.push();
            useBodyFont(13);
            sketch.textAlign(CENTER, CENTER);
            setFill(C.accent);
            sketch.text(`Retour à l'accueil dans ${Math.ceil(remaining/1000)}s`,
                        0, canvas_height/UI_SCALE/2 - 22);
            sketch.pop();
        }
    }

    function drawCategoryBanner() {
        const W = canvas_width  / UI_SCALE;
        const H = canvas_height / UI_SCALE;
        const bar_h = 80;
        const bar_y = -H/2;

        sketch.push();
        setFill(C.bg_panel);
        sketch.noStroke();
        sketch.rectMode(CORNER);
        sketch.rect(-W/2, bar_y, W, bar_h);
        setStroke(C.border);
        sketch.strokeWeight(1);
        sketch.line(-W/2, bar_y + bar_h, W/2, bar_y + bar_h);
        sketch.pop();

        const cat_cy     = bar_y + bar_h / 2;
        const btn_sz     = 48;
        const btn_margin = 24;

        drawButton(-W/2 + btn_margin + btn_sz/2, cat_cy, btn_sz, btn_sz, "◀", () => {
            current_category_idx = Math.max(0, current_category_idx - 1);
            last_interaction_time = millis();
            audio_select.play();
        }, "btn_cat_left");

        drawButton(W/2 - btn_margin - btn_sz/2, cat_cy, btn_sz, btn_sz, "▶", () => {
            current_category_idx = Math.min(category_list.length - 1, current_category_idx + 1);
            last_interaction_time = millis();
            audio_select.play();
        }, "btn_cat_right");

        const current_cat = category_list[current_category_idx] || "Tous";
        sketch.push();
        useDisplayFont(22);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_mid);
        sketch.text(current_cat.toUpperCase(), 0, cat_cy);
        sketch.pop();
    }

    function drawAppGrid() {
        const W      = canvas_width  / UI_SCALE;
        const H      = canvas_height / UI_SCALE;
        const bar_h  = 80;
        const grid_y = -H/2 + bar_h;
        const grid_h = H - bar_h;
        const cell_w = W / GRID_COLS;
        const cell_h = grid_h / GRID_ROWS;

        const current_cat = category_list[current_category_idx] || "Tous";
        const apps        = categories[current_cat] || [];

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const idx = row * GRID_COLS + col;

                if (idx >= apps.length) {
                    sketch.push();
                    setFill(C.bg_deep);
                    setStroke(C.border, 30);
                    sketch.strokeWeight(1);
                    sketch.rectMode(CORNER);
                    sketch.rect(-W/2 + col*cell_w, grid_y + row*cell_h, cell_w, cell_h);
                    sketch.pop();
                    continue;
                }

                const app_name   = apps[idx];
                const meta       = app_metadata[app_name] || { name: app_name };
                const is_running = started_apps.includes(app_name);
                const cx         = -W/2 + col*cell_w + cell_w/2;
                const cy         = grid_y + row*cell_h + cell_h/2;
                const cell_key   = `cell_${idx}`;

                const is_hovered = checkRectHover(
                    -W/2 + col*cell_w + CELL_PAD,
                    grid_y + row*cell_h + CELL_PAD,
                    cell_w - CELL_PAD*2,
                    cell_h - CELL_PAD*2
                );

                if (is_hovered) {
                    cell_hover_times[cell_key] = (cell_hover_times[cell_key] || 0) + frame_delta_ms;
                    last_interaction_time = millis();
                } else {
                    cell_hover_times[cell_key] = 0;
                }

                const hover_t = cell_hover_times[cell_key] || 0;
                drawAppCell(cx, cy, cell_w, cell_h, app_name, meta, is_running, is_hovered, hover_t, idx);
            }
        }

        // Séparateurs
        sketch.push();
        setStroke(C.border, 60);
        sketch.strokeWeight(1);
        sketch.line(0, grid_y, 0, H/2);
        sketch.line(-W/2, grid_y + grid_h/2, W/2, grid_y + grid_h/2);
        sketch.pop();
    }

    function drawAppCell(cx, cy, w, h, app_name, meta, is_running, is_hovered, hover_t, idx) {
        const pad = 10;

        sketch.push();
        if (is_hovered)      setFill(C.bg_hover);
        else                 setFill(C.bg_mid);

        if (is_running)      { setStroke(C.green_i);  sketch.strokeWeight(1.5); }
        else if (is_hovered) { setStroke(C.border_hi); sketch.strokeWeight(1.5); }
        else                 { setStroke(C.border);    sketch.strokeWeight(1); }

        sketch.rectMode(CORNER);
        sketch.rect(cx-w/2+pad, cy-h/2+pad, w-pad*2, h-pad*2, 6);
        sketch.pop();

        const ck   = APP_COLOR_KEYS[app_name] || { fg: C.accent, bg: C.bg_panel };
        const fg   = ck.fg, bg_ic = ck.bg;
        const label = (meta.name || app_name)
            .split(/\s+/).map(w => (w[0]||"").toUpperCase()).join("").slice(0,2);
        const icon_r = 32;

        sketch.push();
        sketch.fill(bg_ic[0], bg_ic[1], bg_ic[2]);
        sketch.stroke(fg[0], fg[1], fg[2], 100);
        sketch.strokeWeight(1);
        sketch.rectMode(CENTER);
        sketch.rect(cx, cy-26, icon_r*2, icon_r*2, 8);
        useDisplayFont(26);
        sketch.textAlign(CENTER, CENTER);
        sketch.fill(fg[0], fg[1], fg[2]);
        sketch.text(label, cx, cy-26);
        sketch.pop();

        sketch.push();
        useDisplayFont(16);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_hi);
        const max_chars = 22;
        const name_str  = meta.name || app_name;
        sketch.text(name_str.length > max_chars ? name_str.slice(0, max_chars-1)+"…" : name_str,
                    cx, cy+20);
        sketch.pop();

        sketch.push();
        useBodyFont(11);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_dim);
        let sub = (meta.category || "").toUpperCase();
        if (is_running) {
            sketch.fill(C.green_i[0], C.green_i[1], C.green_i[2]);
            sub += sub ? " · ACTIF" : "ACTIF";
        }
        sketch.text(sub, cx, cy+42);
        sketch.pop();

        if (is_running) {
            sketch.push();
            sketch.noStroke();
            sketch.fill(C.green_i[0], C.green_i[1], C.green_i[2]);
            sketch.circle(cx-w/2+pad+12, cy-h/2+pad+12, 8);
            sketch.pop();
        }

        if (is_hovered && hover_t > 0) {
            drawPie(cx+w/2-pad-18, cy-h/2+pad+18, 16, hover_t, PIE_DURATION);
        }

        if (hover_t >= PIE_DURATION) {
            cell_hover_times[`cell_${idx}`] = 0;
            selectApp(app_name);
        }
    }

    // ─── ÉCRAN 3 : DESCRIPTION ───────────────────────────────────────────────
    function drawDescriptionScreen() {
        solidBg(...C.bg_deep);
        drawBgGrid();

        if (!selected_app_name) return;

        const meta = app_metadata[selected_app_name] || {};
        const W    = canvas_width  / UI_SCALE;
        const H    = canvas_height / UI_SCALE;

        // Bandeau titre
        const hdr_h = 70;
        const hdr_y = -H/2;

        sketch.push();
        setFill(C.bg_panel);
        sketch.noStroke();
        sketch.rectMode(CORNER);
        sketch.rect(-W/2, hdr_y, W, hdr_h);
        setStroke(C.border);
        sketch.strokeWeight(1);
        sketch.line(-W/2, hdr_y+hdr_h, W/2, hdr_y+hdr_h);
        sketch.pop();

        // Bouton retour
        drawButton(-W/2+52, hdr_y+hdr_h/2, 52, 42, "◄", () => {
            goToScreen(SCREENS.SELECT);
            audio_back.play();
        }, "btn_desc_back");

        // Titre
        sketch.push();
        useDisplayFont(26);
        sketch.textAlign(LEFT, CENTER);
        setFill(C.text_hi);
        sketch.text((meta.name || selected_app_name).toUpperCase(), -W/2+102, hdr_y+hdr_h/2);
        sketch.pop();

        // Badge catégorie
        if (meta.category) {
            sketch.push();
            setFill(C.bg_mid);
            setStroke(C.border);
            sketch.strokeWeight(1);
            sketch.rectMode(CENTER);
            sketch.rect(W/2-100, hdr_y+hdr_h/2, 130, 30, 3);
            useBodyFont(11);
            sketch.textAlign(CENTER, CENTER);
            setFill(C.text_mid);
            sketch.text(meta.category.toUpperCase(), W/2-100, hdr_y+hdr_h/2);
            sketch.pop();
        }

        // Corps : gauche | droite
        const body_y  = hdr_y + hdr_h;
        const body_h  = H - hdr_h;
        const left_w  = W * 0.62;
        const right_w = W - left_w;
        const left_x  = -W/2;
        const right_x = left_x + left_w;

        sketch.push();
        setStroke(C.border);
        sketch.strokeWeight(1);
        sketch.line(right_x, body_y, right_x, H/2);
        sketch.pop();

        // Icône
        const ck    = APP_COLOR_KEYS[selected_app_name] || { fg: C.accent, bg: C.bg_panel };
        const fg    = ck.fg, bg_ic = ck.bg;
        const pad   = 36;
        const icon_sz = 72;
        const icon_cx = left_x + pad + icon_sz/2;
        const icon_cy = body_y + pad + icon_sz/2;

        sketch.push();
        sketch.fill(bg_ic[0], bg_ic[1], bg_ic[2]);
        sketch.stroke(fg[0], fg[1], fg[2], 80);
        sketch.strokeWeight(1);
        sketch.rectMode(CENTER);
        sketch.rect(icon_cx, icon_cy, icon_sz, icon_sz, 10);
        useDisplayFont(30);
        sketch.textAlign(CENTER, CENTER);
        sketch.fill(fg[0], fg[1], fg[2]);
        const label2 = (meta.name || selected_app_name)
            .split(/\s+/).map(w => (w[0]||"").toUpperCase()).join("").slice(0,2);
        sketch.text(label2, icon_cx, icon_cy);
        sketch.pop();

        // Description
        sketch.push();
        useBodyFont(15);
        sketch.textAlign(LEFT, TOP);
        setFill(C.text_mid);
        sketch.textLeading(26);
        drawWrappedText(
            meta.description || "Aucune description.",
            left_x + pad,
            body_y + pad + icon_sz + 24,
            left_w - pad * 2,
            26
        );
        sketch.pop();

        // Chips de métadonnées
        const chips   = buildChips(meta, selected_app_name);
        let chip_x    = left_x + pad;
        const chip_y  = H/2 - 58;
        for (const chip of chips) {
            useBodyFont(11);
            const cw = sketch.textWidth(chip) + 28;
            sketch.push();
            setFill(C.bg_mid);
            setStroke(C.border);
            sketch.strokeWeight(1);
            sketch.rectMode(CORNER);
            sketch.rect(chip_x, chip_y, cw, 26, 3);
            sketch.textAlign(LEFT, CENTER);
            setFill(C.text_mid);
            sketch.text(chip, chip_x+14, chip_y+13);
            sketch.pop();
            chip_x += cw + 10;
        }

        // Bouton JOUER (panneau droit)
        const play_cx = right_x + right_w/2;
        const play_cy = body_y + body_h/2;
        const play_sz = Math.min(right_w * 0.65, body_h * 0.5);

        drawButton(play_cx, play_cy, play_sz, play_sz, "JOUER", () => {
            audio_select.play();
            sketch.emit("core-app_manager-start_application", {
                application_name: selected_app_name
            });
            current_screen = SCREENS.PLAYING;
            pause_gesture_frames = 0;
        }, "btn_desc_play", true);

        // Décoration triangle lecture
        const tri = play_sz * 0.18;
        sketch.push();
        setFill(C.accent2, 40);
        sketch.noStroke();
        sketch.triangle(
            play_cx - tri*0.6, play_cy - tri,
            play_cx - tri*0.6, play_cy + tri,
            play_cx + tri,     play_cy
        );
        sketch.pop();
    }

    function buildChips(meta, app_name) {
        const chips = [];
        if (meta.category)                              chips.push(meta.category.toUpperCase());
        if (app_name === "triangles_full_lesson")       chips.push("10 MIN");
        if (app_name === "triangles_short_lesson")      chips.push("5 MIN");
        if (app_name === "affine")                      chips.push("LIBRE");
        if (app_name === "rabbits_game")                chips.push("LIBRE");
        chips.push("2 JOUEURS");
        return chips;
    }

    // ─── ÉCRAN 4 : PAUSE ─────────────────────────────────────────────────────
    function drawPauseMenu() {
        sketch.push();
        sketch.noStroke();
        sketch.fill(2, 5, 10, 230);
        const W = canvas_width  / UI_SCALE;
        const H = canvas_height / UI_SCALE;
        sketch.rectMode(CENTER);
        sketch.rect(0, 0, W+20, H+20);
        sketch.pop();

        const pw = 480, ph = 440;
        sketch.push();
        setFill(C.bg_panel);
        setStroke(C.border_hi);
        sketch.strokeWeight(1.5);
        sketch.rectMode(CENTER);
        sketch.rect(0, 0, pw, ph, 8);
        sketch.pop();

        sketch.push();
        useDisplayFont(52);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_hi);
        sketch.text("PAUSE", 0, -140);
        sketch.pop();

        sketch.push();
        useBodyFont(12);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_dim);
        sketch.text("APPLICATION EN ATTENTE", 0, -96);
        sketch.pop();

        sketch.push();
        setStroke(C.border);
        sketch.strokeWeight(1);
        sketch.line(-pw/2+32, -68, pw/2-32, -68);
        sketch.pop();

        drawButton(0, -18, 360, 58, "▶  REPRENDRE", () => {
            current_screen = SCREENS.PLAYING;
            audio_select.play();
        }, "btn_pause_resume", true);

        drawButton(0, 58, 360, 52, "↺  REDÉMARRER", () => {
            sketch.emit("core-app_manager-stop_application",  { application_name: selected_app_name });
            sketch.emit("core-app_manager-start_application", { application_name: selected_app_name });
            current_screen = SCREENS.PLAYING;
            audio_select.play();
        }, "btn_pause_restart");

        drawButton(0, 128, 360, 52, "⌂  MENU PRINCIPAL", () => {
            stopSelectedApp();
            setScreenImmediate(SCREENS.SELECT);
            last_interaction_time = millis();
            audio_back.play();
        }, "btn_pause_menu");
    }

    // ─── ÉCRAN 5 : IDLE ──────────────────────────────────────────────────────
    function drawIdleScreen() {
        sketch.push();
        sketch.noStroke();
        sketch.fill(0, 0, 0, 240);
        const W = canvas_width  / UI_SCALE;
        const H = canvas_height / UI_SCALE;
        sketch.rectMode(CENTER);
        sketch.rect(0, 0, W+20, H+20);
        sketch.pop();

        const pw = 560, ph = 380;
        sketch.push();
        setFill(C.bg_panel);
        setStroke(C.border_hi);
        sketch.strokeWeight(1.5);
        sketch.rectMode(CENTER);
        sketch.rect(0, 0, pw, ph, 8);
        sketch.pop();

        sketch.push();
        useDisplayFont(40);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.text_hi);
        sketch.text("ÊTES-VOUS TOUJOURS LÀ ?", 0, -112);
        sketch.pop();

        const elapsed   = millis() - idle_countdown_start;
        const remaining = Math.max(0, IDLE_COUNTDOWN_MAX - elapsed);
        sketch.push();
        useBodyFont(13);
        sketch.textAlign(CENTER, CENTER);
        setFill(C.accent);
        sketch.text(`Retour à l'accueil dans ${Math.ceil(remaining/1000)}s`, 0, -60);
        sketch.pop();

        drawButton(-140, 28, 240, 58, "CONTINUER", () => {
            const target = (selected_app_name && started_apps.includes(selected_app_name))
                ? SCREENS.PLAYING : SCREENS.START;
            setScreenImmediate(target);
            last_interaction_time = millis();
            audio_select.play();
        }, "btn_idle_continue", true);

        drawButton(140, 28, 240, 58, "MENU", () => {
            stopSelectedApp();
            setScreenImmediate(SCREENS.SELECT);
            last_interaction_time = millis();
            audio_back.play();
        }, "btn_idle_menu");
    }

    // ─── COMPOSANT : BOUTON ──────────────────────────────────────────────────
    function drawButton(x, y, w, h, label, callback, id, primary) {
        id = id || `btn_${x}_${y}`;

        const is_hovered = checkRectHover(
            x - w/2 - BUTTON_PAD,
            y - h/2 - BUTTON_PAD,
            w + BUTTON_PAD*2,
            h + BUTTON_PAD*2
        );

        sketch.push();
        if (primary && is_hovered)       setFill(C.bg_hover);
        else if (primary)                setFill(C.bg_panel);
        else if (is_hovered)             setFill(C.bg_hover);
        else                             setFill(C.bg_mid);

        if (primary && is_hovered)       setStroke(C.accent);
        else if (primary)                setStroke(C.border_hi);
        else if (is_hovered)             setStroke(C.border_hi);
        else                             setStroke(C.border);

        sketch.strokeWeight(1.5);
        sketch.rectMode(CENTER);
        sketch.rect(x, y, w, h, 5);
        sketch.pop();

        sketch.push();
        const fs = Math.max(14, Math.min(24, Math.round(h * 0.30)));
        useDisplayFont(fs);
        sketch.textAlign(CENTER, CENTER);
        if (primary)  setFill(is_hovered ? C.accent2 : C.text_mid);
        else          setFill(is_hovered ? C.text_hi  : C.text_mid);
        sketch.text(label, x, y);
        sketch.pop();

        if (is_hovered) {
            if (!button_hover_times[id]) button_hover_times[id] = 0;
            button_hover_times[id] += frame_delta_ms;
            last_interaction_time = millis();
            drawPie(x+w/2-12, y-h/2+10, 10, button_hover_times[id], PIE_DURATION);
            if (button_hover_times[id] >= PIE_DURATION) {
                button_hover_times[id] = 0;
                callback();
            }
        } else {
            button_hover_times[id] = 0;
        }
    }

    // ─── COMPOSANT : CAMEMBERT ───────────────────────────────────────────────
    function drawPie(cx, cy, r, current_t, max_t) {
        const progress = Math.min(1, current_t / max_t);
        const angle    = progress * TWO_PI;

        sketch.push();
        setStroke(C.border);
        sketch.strokeWeight(1.5);
        sketch.noFill();
        sketch.circle(cx, cy, r*2);
        sketch.pop();

        if (angle > 0) {
            sketch.push();
            setFill(C.accent, 180);
            sketch.noStroke();
            sketch.arc(cx, cy, r*2, r*2, -HALF_PI, -HALF_PI+angle, PIE);
            sketch.pop();
        }
    }

    // ─── CURSEUR ─────────────────────────────────────────────────────────────
    function drawCursor() {
        const ptr = getPrimaryPointer();
        if (!ptr) return;
        sketch.push();
        sketch.noStroke();
        setFill(C.text_hi, 200);
        sketch.circle(ptr.x, ptr.y, CURSOR_R*2);
        setFill(C.accent, 50);
        sketch.circle(ptr.x, ptr.y, CURSOR_R*4);
        sketch.pop();
    }

    // ─── GESTES PAUSE ────────────────────────────────────────────────────────
    function checkPauseGesture() {
        if (hands_position.length < 2) return;
        const h1x = hands_position[0][8][0] * canvas_width;
        const h1y = hands_position[0][8][1] * canvas_height;
        const h2x = hands_position[1][8][0] * canvas_width;
        const h2y = hands_position[1][8][1] * canvas_height;

        if (Math.abs(h1x-h2x) > PAUSE_GESTURE_THRESHOLD && Math.abs(h1y-h2y) < 150) {
            pause_gesture_frames++;
            if (pause_gesture_frames > 15) {
                current_screen = SCREENS.PAUSE;
                pause_gesture_frames = 0;
            }
        } else {
            pause_gesture_frames = 0;
        }
    }

    // ─── UTILITAIRES ─────────────────────────────────────────────────────────
    function organizeByCategories() {
        categories = {};
        for (const app of all_apps) {
            const cat = (app_metadata[app] && app_metadata[app].category) || "Autres";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(app);
        }
        category_list = Object.keys(categories).sort();
        if (category_list.length === 0) {
            category_list = ["Tous"];
            categories["Tous"] = [...all_apps];
        }
    }

    function selectApp(name) {
        selected_app_name = name;
        goToScreen(SCREENS.DESCRIPTION);
        audio_select.play();
    }

    function updateTimings() {
        if (current_screen === SCREENS.SELECT) {
            const now = millis();
            if (now - last_interaction_time < 100) select_inactivity_start = now;
        }
    }

    function getPrimaryPointer() {
        for (const hand of hands_position) {
            if (!hand || hand.length < 21) continue;
            let px = hand[8][0] * canvas_width  - canvas_width  / 2;
            let py = hand[8][1] * canvas_height - canvas_height / 2;
            px /= UI_SCALE;
            py /= UI_SCALE;
            if (MENU_ROTATE_180) { px = -px; py = -py; }
            return { x: px, y: py };
        }
        return null;
    }

    function checkRectHover(rect_x, rect_y, rect_w, rect_h) {
        const ptr = getPrimaryPointer();
        if (!ptr) return false;
        return ptr.x > rect_x - INDEX_HOVER_RADIUS &&
                ptr.x < rect_x + rect_w + INDEX_HOVER_RADIUS &&
                ptr.y > rect_y - INDEX_HOVER_RADIUS &&
                ptr.y < rect_y + rect_h + INDEX_HOVER_RADIUS;
    }
});
