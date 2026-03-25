// ============================================================================
// INTERACTIVE POOL - Menu redesign (2D / no WEBGL)
// -----------------------------------------------------------------------------
// Goals:
// - keep the current interaction model (finger hover + radial hold)
// - keep the current navigation flow (START -> SELECT -> DESCRIPTION -> PLAYING)
// - replace WEBGL rendering with a stable 2D renderer
// - use a sober, homogeneous visual style with opaque panels
// ============================================================================

export const menu = new p5((sketch) => {
    sketch.name = "menu";
    sketch.activated = false;

    const SCREENS = {
        START: "start",
        SELECT: "select",
        DESCRIPTION: "description",
        PLAYING: "playing",
        PAUSE: "pause",
        IDLE: "idle",
    };

    const UI_SCALE = 0.62;
    const MENU_ROTATE_180 = true;
    const PIE_DURATION_MS = 1600;
    const SELECT_TIMEOUT_MS = 120000;
    const IDLE_TIMEOUT_MS = 60000;
    const IDLE_COUNTDOWN_MS = 30000;
    const PAUSE_GESTURE_THRESHOLD = 300;
    const PAUSE_GESTURE_VERTICAL_LIMIT = 150;
    const PAUSE_GESTURE_MIN_FRAMES = 15;
    const INDEX_CURSOR_RADIUS = 12;
    const INDEX_HOVER_RADIUS = 42;
    const OVERDRAW = 16;

    const THEME = {
        bg: [10, 16, 28],
        bgAlt: [18, 28, 44],
        panel: [16, 24, 38],
        panelSoft: [22, 32, 50],
        border: [132, 177, 214],
        accent: [82, 194, 255],
        accentSoft: [38, 124, 170],
        good: [92, 214, 142],
        warn: [255, 173, 96],
        danger: [255, 118, 118],
        text: [241, 247, 255],
        textSoft: [173, 188, 206],
        shadow: [0, 0, 0, 120],
    };

    let font = null;
    let socket = null;
    let canvasWidth = 0;
    let canvasHeight = 0;

    let hands_position = [];
    let all_apps = [];
    let app_metadata = {};
    let categories = {};
    let category_list = [];
    let current_category_idx = 0;
    let selected_app_name = null;
    let started_apps = [];

    let current_screen = SCREENS.START;
    let next_screen = null;

    let last_interaction_time = 0;
    let select_inactivity_start = 0;
    let idle_countdown_start = 0;
    let pause_gesture_frames = 0;

    let cell_hover_times = {};
    let button_hover_times = {};

    const audio_select = new Audio("./home/apps/menu/components/click.mp3");
    const audio_back = new Audio("./home/apps/menu/components/click.mp3");
    const audio_open = new Audio("./home/apps/menu/components/opening_menu.mp3");

    sketch.preload = () => {
        font = sketch.loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");

        let url = sketch.getURLPath();
        url.splice(-1);
        url = url.join("/");

        sketch.loadJSON("/" + url + "/platform/home/config.json", (data) => {
            if (data.applications && data.applications.menu_control) {
                all_apps = data.applications.menu_control;
            }
            if (data.app_metadata) {
                app_metadata = data.app_metadata;
            }
            organizeByCategories();
        });
    };

    sketch.set = (width, height, sock) => {
        canvasWidth = width;
        canvasHeight = height;

        sketch.selfCanvas = sketch.createCanvas(width, height).position(0, 0);
        sketch.selfCanvas.elt.style.background = "transparent";
        sketch.selfCanvas.elt.style.imageRendering = "auto";

        socket = sock;
        sketch.activated = true;

        socket.on(sketch.name, (data) => {
            hands_position = (data && data.hands_landmarks) ? data.hands_landmarks : [];
            if (hands_position.length > 0) {
                last_interaction_time = sketch.millis();
            }
        });

        socket.on("core-app_manager-started_applications", async (data) => {
            started_apps = (data.applications || []).map((app) => app.name);
            if (selected_app_name && started_apps.includes(selected_app_name)) {
                setScreenImmediate(SCREENS.PLAYING);
                pause_gesture_frames = 0;
            }
        });

        sketch.emit = (name, data) => {
            socket.emit(name, data);
        };
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {};

    sketch.windowResized = () => {
        if (!sketch.selfCanvas) return;
        sketch.resizeCanvas(window.innerWidth, window.innerHeight);
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
    };

    sketch.show = () => {
        if (!sketch.activated) return;

        sketch.clear();
        sketch.noStroke();
        if (font) sketch.textFont(font);
        sketch.textStyle(sketch.NORMAL);

        if (next_screen) {
            current_screen = next_screen;
            next_screen = null;
            resetHoverTimes();
        }

        updateTimers();
        if (current_screen === SCREENS.PLAYING) {
            checkPauseGesture();
            return;
        }

        sketch.push();
        sketch.translate(sketch.width / 2, sketch.height / 2);
        sketch.scale(UI_SCALE);
        if (MENU_ROTATE_180) {
            sketch.rotate(sketch.PI);
        }

        drawSceneBackground();

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
            case SCREENS.PAUSE:
                drawPauseMenu();
                break;
            case SCREENS.IDLE:
                drawIdleScreen();
                break;
            default:
                drawStartScreen();
                break;
        }

        drawIndexCursor();
        sketch.pop();
    };

    function organizeByCategories() {
        categories = {};

        for (const app of all_apps) {
            if (!app_metadata[app] || app_metadata[app].enabled === false) continue;
            const category = app_metadata[app].category || "Autres";
            if (!categories[category]) categories[category] = [];
            categories[category].push(app);
        }

        category_list = Object.keys(categories).sort();
        if (category_list.length === 0) {
            category_list = ["Tous"];
            categories["Tous"] = [...all_apps];
        }
        current_category_idx = Math.min(current_category_idx, Math.max(category_list.length - 1, 0));
    }

    function updateTimers() {
        const now = sketch.millis();
        const timeSinceInteraction = now - last_interaction_time;

        if (current_screen === SCREENS.PLAYING && timeSinceInteraction > IDLE_TIMEOUT_MS) {
            idle_countdown_start = now;
            setScreenImmediate(SCREENS.IDLE);
        }

        if (current_screen === SCREENS.SELECT && select_inactivity_start > 0 && (now - select_inactivity_start > SELECT_TIMEOUT_MS)) {
            setScreenImmediate(SCREENS.START);
        }

        if (current_screen === SCREENS.IDLE && (now - idle_countdown_start > IDLE_COUNTDOWN_MS)) {
            stopSelectedApp();
            selected_app_name = null;
            setScreenImmediate(SCREENS.START);
            last_interaction_time = now;
        }
    }

    function resetHoverTimes() {
        cell_hover_times = {};
        button_hover_times = {};
    }

    function goToScreen(screenName) {
        if (current_screen !== screenName) {
            next_screen = screenName;
        }
    }

    function setScreenImmediate(screenName) {
        current_screen = screenName;
        next_screen = null;
        resetHoverTimes();
    }

    function selectApp(appName) {
        selected_app_name = appName;
        audio_select.currentTime = 0;
        audio_select.play();
        goToScreen(SCREENS.DESCRIPTION);
    }

    function stopSelectedApp() {
        if (!selected_app_name) return;
        if (!started_apps.includes(selected_app_name)) return;
        sketch.emit("core-app_manager-stop_application", {
            application_name: selected_app_name,
        });
        started_apps = started_apps.filter((name) => name !== selected_app_name);
    }

    function launchSelectedApp() {
        if (!selected_app_name) return;
        audio_select.currentTime = 0;
        audio_select.play();
        sketch.emit("core-app_manager-start_application", {
            application_name: selected_app_name,
        });
        setScreenImmediate(SCREENS.PLAYING);
        pause_gesture_frames = 0;
    }

    function drawSceneBackground() {
        const w = sketch.width;
        const h = sketch.height;

        sketch.push();
        sketch.noStroke();
        sketch.fill(...THEME.bg, 255);
        sketch.rect(-w / 2 - OVERDRAW, -h / 2 - OVERDRAW, w + OVERDRAW * 2, h + OVERDRAW * 2);

        // subtle layered panels to keep a menu spirit without visual overload
        sketch.fill(...THEME.bgAlt, 150);
        sketch.rect(-w / 2 + 36, -h / 2 + 36, w - 72, h - 72, 28);
        sketch.fill(...THEME.panel, 140);
        sketch.rect(-w / 2 + 68, -h / 2 + 68, w - 136, h - 136, 22);
        sketch.pop();
    }

    function drawStartScreen() {
        drawHeader("Interactive Pool", "Navigation gestuelle sur table de billard augmentée");

        drawInfoPanel(-350, -20, 700, 220, [
            "1. Placez votre main au-dessus de la table",
            "2. Restez sur un bouton pour valider",
            "3. Écartez les deux mains pour ouvrir la pause en jeu",
        ]);

        drawPrimaryButton(0, 220, 360, 108, "Démarrer", () => {
            audio_open.currentTime = 0;
            audio_open.play();
            select_inactivity_start = sketch.millis();
            last_interaction_time = sketch.millis();
            goToScreen(SCREENS.SELECT);
        }, "start_main");
    }

    function drawSelectScreen() {
        drawHeader("Choix de l'activité", "Sélectionnez une activité avec maintien du curseur");
        drawCategoryStrip();
        drawAppsGrid();

        const timeRemaining = Math.max(0, SELECT_TIMEOUT_MS - (sketch.millis() - select_inactivity_start));
        if (timeRemaining < 30000) {
            drawFooterNotice(`Retour à l'accueil dans ${Math.ceil(timeRemaining / 1000)} s`, THEME.warn);
        }
    }

    function drawDescriptionScreen() {
        const meta = app_metadata[selected_app_name] || { name: selected_app_name || "Activité", description: "" };
        drawHeader(meta.name || "Activité", meta.category || "Description");

        const bodyY = -150;

        sketch.push();
        drawCard(-540, bodyY, 560, 360, true);
        drawCard(40, bodyY, 500, 360, false);
        sketch.pop();

        sketch.push();
        sketch.fill(...THEME.text);
        sketch.textAlign(sketch.LEFT, sketch.TOP);
        setTextSize(24);
        sketch.text("Description", -500, bodyY + 36);
        sketch.fill(...THEME.textSoft);
        setTextSize(18);
        drawWrappedText(meta.description || "Aucune description disponible.", -500, bodyY + 94, 460, 32);
        sketch.pop();

        const initials = ((meta.name || selected_app_name || "AP")
            .split(/\s+/)
            .map((w) => w[0] || "")
            .join("")
            .slice(0, 2)
            .toUpperCase()) || "AP";

        sketch.push();
        sketch.fill(...THEME.accentSoft, 255);
        sketch.circle(290, bodyY + 124, 190);
        sketch.fill(...THEME.text);
        setTextSize(68);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.text(meta.icon || initials, 290, bodyY + 124);
        sketch.fill(...THEME.textSoft);
        setTextSize(20);
        sketch.text(meta.category || "Activité", 290, bodyY + 250);
        sketch.pop();

        drawSecondaryButton(-220, 260, 300, 94, "Retour", () => {
            audio_back.currentTime = 0;
            audio_back.play();
            goToScreen(SCREENS.SELECT);
        }, "desc_back");

        drawPrimaryButton(220, 260, 300, 94, started_apps.includes(selected_app_name) ? "Relancer" : "Jouer", () => {
            launchSelectedApp();
        }, "desc_play");
    }

    function drawPauseMenu() {
        drawOverlayBackdrop();
        drawHeader("Pause", "Le jeu est suspendu");
        drawPrimaryButton(0, -40, 420, 96, "Reprendre", () => {
            audio_select.currentTime = 0;
            audio_select.play();
            setScreenImmediate(SCREENS.PLAYING);
        }, "pause_resume");

        drawSecondaryButton(0, 90, 420, 96, "Redémarrer", () => {
            if (!selected_app_name) return;
            sketch.emit("core-app_manager-stop_application", { application_name: selected_app_name });
            sketch.emit("core-app_manager-start_application", { application_name: selected_app_name });
            audio_select.currentTime = 0;
            audio_select.play();
            setScreenImmediate(SCREENS.PLAYING);
        }, "pause_restart");

        drawSecondaryButton(0, 220, 420, 96, "Retour menu", () => {
            stopSelectedApp();
            audio_back.currentTime = 0;
            audio_back.play();
            select_inactivity_start = sketch.millis();
            setScreenImmediate(SCREENS.SELECT);
        }, "pause_menu");
    }

    function drawIdleScreen() {
        drawOverlayBackdrop();
        drawHeader("Toujours présent ?", "Aucune activité détectée");

        const timeRemaining = Math.max(0, IDLE_COUNTDOWN_MS - (sketch.millis() - idle_countdown_start));
        drawInfoPanel(-360, -30, 720, 180, [
            `Retour automatique à l'accueil dans ${Math.ceil(timeRemaining / 1000)} s`,
            "Continuez la partie ou revenez au menu principal.",
        ]);

        drawPrimaryButton(-220, 210, 300, 94, "Continuer", () => {
            last_interaction_time = sketch.millis();
            if (selected_app_name && started_apps.includes(selected_app_name)) {
                setScreenImmediate(SCREENS.PLAYING);
            } else {
                setScreenImmediate(SCREENS.START);
            }
        }, "idle_continue");

        drawSecondaryButton(220, 210, 300, 94, "Retour menu", () => {
            stopSelectedApp();
            selected_app_name = null;
            last_interaction_time = sketch.millis();
            select_inactivity_start = sketch.millis();
            setScreenImmediate(SCREENS.SELECT);
        }, "idle_menu");
    }

    function drawHeader(title, subtitle) {
        sketch.push();
        sketch.fill(...THEME.text);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        setTextSize(72);
        sketch.text(title, 0, -330);
        sketch.fill(...THEME.textSoft);
        setTextSize(22);
        sketch.text(subtitle, 0, -280);
        sketch.pop();
    }

    function drawCategoryStrip() {
        const y = -208;
        drawCard(-620, y - 48, 1240, 116, false);

        const currentCategory = category_list[current_category_idx] || "Tous";

        drawSecondaryButton(-500, y, 120, 72, "◀", () => {
            current_category_idx = Math.max(0, current_category_idx - 1);
            select_inactivity_start = sketch.millis();
            audio_select.currentTime = 0;
            audio_select.play();
        }, "cat_prev", { compact: true });

        drawSecondaryButton(500, y, 120, 72, "▶", () => {
            current_category_idx = Math.min(category_list.length - 1, current_category_idx + 1);
            select_inactivity_start = sketch.millis();
            audio_select.currentTime = 0;
            audio_select.play();
        }, "cat_next", { compact: true });

        sketch.push();
        sketch.fill(...THEME.text);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        setTextSize(30);
        sketch.text(currentCategory, 0, y - 8);
        sketch.fill(...THEME.textSoft);
        setTextSize(17);
        sketch.text(`${current_category_idx + 1} / ${Math.max(category_list.length, 1)}`, 0, y + 26);
        sketch.pop();
    }

    function drawAppsGrid() {
        const currentCategory = category_list[current_category_idx] || "Tous";
        const apps = categories[currentCategory] || [];
        const cols = 2;
        const rows = 2;
        const cellW = 520;
        const cellH = 190;
        const gapX = 42;
        const gapY = 34;
        const startX = -cellW - gapX / 2;
        const startY = -90;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const idx = row * cols + col;
                const appName = apps[idx];
                const x = startX + col * (cellW + gapX);
                const y = startY + row * (cellH + gapY);

                if (!appName) {
                    drawCard(x, y, cellW, cellH, false, 110);
                    continue;
                }

                const meta = app_metadata[appName] || { name: appName, category: currentCategory };
                const running = started_apps.includes(appName);
                const hoverKey = `app_${idx}`;
                const hovering = hoverRect(x, y, cellW, cellH);

                if (hovering) {
                    cell_hover_times[hoverKey] = (cell_hover_times[hoverKey] || 0) + sketch.deltaTime;
                    select_inactivity_start = sketch.millis();
                } else {
                    cell_hover_times[hoverKey] = 0;
                }

                drawAppCard(x, y, cellW, cellH, meta, running, cell_hover_times[hoverKey] || 0);

                if ((cell_hover_times[hoverKey] || 0) >= PIE_DURATION_MS) {
                    cell_hover_times[hoverKey] = 0;
                    selectApp(appName);
                }
            }
        }
    }

    function drawAppCard(x, y, w, h, meta, running, hoverTime) {
        const hovering = hoverRect(x, y, w, h);
        drawCard(x, y, w, h, hovering, 255, running ? THEME.good : THEME.border);

        const title = meta.name || "Activité";
        const description = meta.description || "";
        const initials = (title.split(/\s+/).map((word) => word[0] || "").join("").slice(0, 2).toUpperCase()) || "AP";

        sketch.push();
        sketch.fill(...THEME.accentSoft, 255);
        sketch.circle(x + 86, y + 96, 92);
        sketch.fill(...THEME.text);
        setTextSize(30);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.text(meta.icon || initials, x + 86, y + 96);

        sketch.textAlign(sketch.LEFT, sketch.TOP);
        sketch.fill(...THEME.text);
        setTextSize(26);
        sketch.text(title, x + 160, y + 42);
        sketch.fill(...THEME.textSoft);
        setTextSize(16);
        drawWrappedText(description, x + 160, y + 84, 300, 24, 2);

        if (running) {
            sketch.fill(...THEME.good);
            setTextSize(15);
            sketch.text("Actif", x + w - 90, y + 28);
        }
        sketch.pop();

        if (hoverTime > 0) {
            drawHoldIndicator(x + w - 54, y + 58, 26, hoverTime, PIE_DURATION_MS);
        }
    }

    function drawCard(x, y, w, h, active = false, alpha = 255, borderColor = null) {
        const border = borderColor || (active ? THEME.accent : THEME.border);
        const fillColor = active ? THEME.panelSoft : THEME.panel;

        sketch.push();
        sketch.noStroke();
        sketch.fill(...THEME.shadow);
        sketch.rect(x + 10, y + 12, w, h, 20);

        sketch.fill(fillColor[0], fillColor[1], fillColor[2], alpha);
        sketch.stroke(border[0], border[1], border[2], alpha);
        sketch.strokeWeight(active ? 4 : 2);
        sketch.rect(x, y, w, h, 20);
        sketch.pop();
    }

    function drawInfoPanel(x, y, w, h, lines) {
        drawCard(x, y, w, h, false);
        sketch.push();
        sketch.fill(...THEME.textSoft);
        sketch.textAlign(sketch.LEFT, sketch.TOP);
        setTextSize(22);
        let cursorY = y + 34;
        for (const line of lines) {
            sketch.text(line, x + 36, cursorY);
            cursorY += 48;
        }
        sketch.pop();
    }

    function drawFooterNotice(message, colorTuple) {
        sketch.push();
        sketch.fill(colorTuple[0], colorTuple[1], colorTuple[2]);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        setTextSize(20);
        sketch.text(message, 0, sketch.height / 2 - 80);
        sketch.pop();
    }

    function drawOverlayBackdrop() {
        sketch.push();
        sketch.noStroke();
        sketch.fill(4, 8, 16, 235);
        sketch.rect(-sketch.width / 2 - OVERDRAW, -sketch.height / 2 - OVERDRAW, sketch.width + OVERDRAW * 2, sketch.height + OVERDRAW * 2);
        sketch.pop();
    }

    function drawPrimaryButton(cx, cy, w, h, label, callback, key, options = {}) {
        drawButton(cx, cy, w, h, label, callback, key, {
            ...options,
            fill: THEME.accentSoft,
            border: THEME.accent,
        });
    }

    function drawSecondaryButton(cx, cy, w, h, label, callback, key, options = {}) {
        drawButton(cx, cy, w, h, label, callback, key, {
            ...options,
            fill: THEME.panelSoft,
            border: THEME.border,
        });
    }

    function drawButton(cx, cy, w, h, label, callback, key, options = {}) {
        const x = cx - w / 2;
        const y = cy - h / 2;
        const hovering = hoverRect(x, y, w, h);
        const hoverKey = `btn_${key}`;

        if (hovering) {
            button_hover_times[hoverKey] = (button_hover_times[hoverKey] || 0) + sketch.deltaTime;
            last_interaction_time = sketch.millis();
            if (current_screen === SCREENS.SELECT) {
                select_inactivity_start = sketch.millis();
            }
        } else {
            button_hover_times[hoverKey] = 0;
        }

        const fill = options.fill || THEME.panelSoft;
        const border = options.border || THEME.border;
        const alpha = hovering ? 255 : 230;

        sketch.push();
        sketch.noStroke();
        sketch.fill(...THEME.shadow);
        sketch.rect(x + 8, y + 10, w, h, 18);

        sketch.fill(fill[0], fill[1], fill[2], alpha);
        sketch.stroke(border[0], border[1], border[2], 255);
        sketch.strokeWeight(hovering ? 4 : 2);
        sketch.rect(x, y, w, h, 18);

        sketch.fill(...THEME.text);
        sketch.noStroke();
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        setTextSize(options.compact ? 28 : 24);
        sketch.text(label, cx, cy + 2);
        sketch.pop();

        const hoverTime = button_hover_times[hoverKey] || 0;
        if (hoverTime > 0) {
            drawHoldIndicator(x + w - 34, y + 34, 20, hoverTime, PIE_DURATION_MS);
        }

        if (hoverTime >= PIE_DURATION_MS) {
            button_hover_times[hoverKey] = 0;
            callback();
        }
    }

    function drawHoldIndicator(cx, cy, radius, elapsedMs, durationMs) {
        const progress = Math.min(elapsedMs / durationMs, 1);
        const startAngle = -sketch.HALF_PI;
        const endAngle = startAngle + progress * sketch.TWO_PI;

        sketch.push();
        sketch.noFill();
        sketch.stroke(...THEME.textSoft, 180);
        sketch.strokeWeight(4);
        sketch.circle(cx, cy, radius * 2);
        sketch.stroke(...THEME.good, 255);
        sketch.arc(cx, cy, radius * 2, radius * 2, startAngle, endAngle);
        sketch.pop();
    }

    function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
        const words = (text || "").split(/\s+/);
        let line = "";
        let cursorY = y;
        let linesDrawn = 0;

        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (sketch.textWidth(candidate) > maxWidth && line) {
                sketch.text(line, x, cursorY);
                linesDrawn += 1;
                if (linesDrawn >= maxLines) return;
                line = word;
                cursorY += lineHeight;
            } else {
                line = candidate;
            }
        }

        if (line && linesDrawn < maxLines) {
            sketch.text(line, x, cursorY);
        }
    }

    function setTextSize(size) {
        sketch.textSize(Math.round(size * 1.1));
    }

    function getPrimaryIndexPointer() {
        if (!hands_position || hands_position.length === 0) return null;

        for (const hand of hands_position) {
            if (!hand || hand.length < 21 || !hand[8]) continue;

            let x = hand[8][0] * sketch.width;
            let y = hand[8][1] * sketch.height;

            x = (x - sketch.width / 2) / UI_SCALE;
            y = (y - sketch.height / 2) / UI_SCALE;

            if (MENU_ROTATE_180) {
                x = -x;
                y = -y;
            }

            return { x, y };
        }

        return null;
    }

    function hoverRect(x, y, w, h) {
        const pointer = getPrimaryIndexPointer();
        if (!pointer) return false;

        return (
            pointer.x >= x - INDEX_HOVER_RADIUS &&
            pointer.x <= x + w + INDEX_HOVER_RADIUS &&
            pointer.y >= y - INDEX_HOVER_RADIUS &&
            pointer.y <= y + h + INDEX_HOVER_RADIUS
        );
    }

    function drawIndexCursor() {
        const pointer = getPrimaryIndexPointer();
        if (!pointer) return;

        sketch.push();
        sketch.noStroke();
        sketch.fill(...THEME.text);
        sketch.circle(pointer.x, pointer.y, INDEX_CURSOR_RADIUS * 2);
        sketch.fill(...THEME.accent);
        sketch.circle(pointer.x, pointer.y, INDEX_CURSOR_RADIUS);
        sketch.pop();
    }

    function checkPauseGesture() {
        if (!hands_position || hands_position.length < 2) {
            pause_gesture_frames = 0;
            return;
        }

        const hand1 = hands_position[0][8];
        const hand2 = hands_position[1][8];
        if (!hand1 || !hand2) {
            pause_gesture_frames = 0;
            return;
        }

        const x1 = hand1[0] * sketch.width;
        const y1 = hand1[1] * sketch.height;
        const x2 = hand2[0] * sketch.width;
        const y2 = hand2[1] * sketch.height;

        const horizontalDistance = Math.abs(x1 - x2);
        const verticalDistance = Math.abs(y1 - y2);

        if (horizontalDistance > PAUSE_GESTURE_THRESHOLD && verticalDistance < PAUSE_GESTURE_VERTICAL_LIMIT) {
            pause_gesture_frames += 1;
            if (pause_gesture_frames >= PAUSE_GESTURE_MIN_FRAMES) {
                pause_gesture_frames = 0;
                setScreenImmediate(SCREENS.PAUSE);
            }
        } else {
            pause_gesture_frames = 0;
        }
    }
});
