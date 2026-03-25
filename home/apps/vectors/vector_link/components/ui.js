export const VECTOR_THEME = {
    bg: [12, 18, 30],
    panel: [16, 25, 40, 190],
    panelSoft: [28, 42, 68, 165],
    border: [196, 223, 255, 210],
    text: [245, 249, 255],
    textSoft: [204, 218, 238],
    cyan: [73, 212, 255],
    green: [102, 246, 162],
    red: [255, 118, 118],
    yellow: [255, 214, 102],
    whiteBall: [255, 255, 255],
};

function fillTuple(sketch, tuple) {
    if (tuple.length === 4) sketch.fill(tuple[0], tuple[1], tuple[2], tuple[3]);
    else sketch.fill(tuple[0], tuple[1], tuple[2]);
}

function strokeTuple(sketch, tuple) {
    if (tuple.length === 4) sketch.stroke(tuple[0], tuple[1], tuple[2], tuple[3]);
    else sketch.stroke(tuple[0], tuple[1], tuple[2]);
}

export function drawRoundedPanel(sketch, x, y, w, h, radius = 18) {
    sketch.push();
    sketch.noStroke();
    sketch.fill(0, 0, 0, 70);
    sketch.rect(x + 10, y + 12, w, h, radius);
    fillTuple(sketch, VECTOR_THEME.panel);
    strokeTuple(sketch, VECTOR_THEME.border);
    sketch.strokeWeight(2.5);
    sketch.rect(x, y, w, h, radius);
    sketch.pop();
}

export function drawHeaderBadge(sketch, x, y, label, value, color = VECTOR_THEME.cyan) {
    sketch.push();
    sketch.noStroke();
    sketch.fill(0, 0, 0, 120);
    sketch.rect(x, y, 210, 52, 12);
    sketch.fill(color[0], color[1], color[2], 42);
    sketch.rect(x, y, 210, 52, 12);
    sketch.fill(...VECTOR_THEME.textSoft);
    sketch.textAlign(sketch.LEFT, sketch.CENTER);
    sketch.textSize(18);
    sketch.text(label, x + 16, y + 26);
    sketch.fill(...VECTOR_THEME.text);
    sketch.textAlign(sketch.RIGHT, sketch.CENTER);
    sketch.textSize(20);
    sketch.text(value, x + 192, y + 26);
    sketch.pop();
}

export function drawStatusPanel(sketch, cfg) {
    const {
        x = 38, y = 38, w = 780, h = 260,
        title = '', message = '', footer = '',
        metrics = [], scoreText = null, scoreColor = VECTOR_THEME.green,
        subtitle = null,
    } = cfg;

    drawRoundedPanel(sketch, x, y, w, h, 18);

    sketch.push();
    sketch.noStroke();
    sketch.fill(...VECTOR_THEME.text);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.textSize(30);
    sketch.text(title, x + 26, y + 22);

    if (subtitle) {
        sketch.fill(...VECTOR_THEME.textSoft);
        sketch.textSize(18);
        sketch.text(subtitle, x + 28, y + 58);
    }

    sketch.fill(...VECTOR_THEME.textSoft);
    sketch.textSize(20);
    sketch.textLeading(30);
    sketch.text(message, x + 28, y + 88, w - 56, 86);

    let metricY = y + h - 88;
    sketch.textSize(18);
    sketch.fill(...VECTOR_THEME.text);
    for (const metric of metrics) {
        if (!metric) continue;
        sketch.text(metric, x + 28, metricY);
        metricY += 24;
    }

    if (footer) {
        sketch.fill(...VECTOR_THEME.textSoft);
        sketch.textSize(16);
        sketch.text(footer, x + 28, y + h - 28);
    }

    if (scoreText !== null) {
        sketch.textAlign(sketch.RIGHT, sketch.TOP);
        sketch.fill(scoreColor[0], scoreColor[1], scoreColor[2]);
        sketch.textSize(50);
        sketch.text(scoreText, x + w - 24, y + 20);
    }
    sketch.pop();
}

export function drawArrow(sketch, start, end, color, weight = 8) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowSize = 26;

    sketch.push();
    strokeTuple(sketch, color);
    sketch.strokeWeight(weight);
    sketch.strokeCap(sketch.ROUND);
    sketch.strokeJoin(sketch.ROUND);
    sketch.line(start.x, start.y, end.x, end.y);
    sketch.translate(end.x, end.y);
    sketch.rotate(angle);
    sketch.line(0, 0, -arrowSize, -arrowSize * 0.55);
    sketch.line(0, 0, -arrowSize, arrowSize * 0.55);
    sketch.pop();
}

export function drawTargetRings(sketch, x, y, color = VECTOR_THEME.cyan, radii = [42, 74]) {
    sketch.push();
    sketch.noFill();
    strokeTuple(sketch, color);
    sketch.strokeWeight(4);
    for (const radius of radii) {
        sketch.circle(x, y, radius * 2);
    }
    sketch.pop();
}

export function drawBallOutline(sketch, x, y, radius, color = VECTOR_THEME.whiteBall, weight = 5, alpha = 255) {
    sketch.push();
    sketch.noFill();
    sketch.stroke(color[0], color[1], color[2], alpha);
    sketch.strokeWeight(weight);
    sketch.circle(x, y, radius * 2);
    sketch.pop();
}

export function drawBallLabel(sketch, x, y, label, color = VECTOR_THEME.cyan) {
    sketch.push();
    sketch.noStroke();
    sketch.fill(0, 0, 0, 135);
    sketch.rect(x - 24, y - 72, 48, 34, 10);
    sketch.fill(color[0], color[1], color[2]);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.textSize(23);
    sketch.text(label, x, y - 55);
    sketch.pop();
}
