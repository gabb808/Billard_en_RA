const TABLE_WIDTH = 1920;
const TABLE_HEIGHT = 1080;
const TABLE_MARGIN = 120;
const MAX_TRACK_DISTANCE = 160;
const BALL_RADIUS = 38;
const MIN_CHALLENGE_LENGTH = 260;
const MAX_CHALLENGE_LENGTH = 640;
const MOVEMENT_START_THRESHOLD = 14;
const MOVEMENT_STOP_THRESHOLD = 4;
const STABLE_TIME_MS = 900;
const RESULT_TIME_MS = 3500;
const CORRIDOR_WIDTH_EASY = 80;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function distance(a, b) {
    return Math.sqrt(dist2(a, b));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function randomChoice(sketch, items) {
    return items[Math.floor(sketch.random(items.length))];
}

function pointOnSegmentProjection(point, start, end) {
    const vx = end.x - start.x;
    const vy = end.y - start.y;
    const wx = point.x - start.x;
    const wy = point.y - start.y;
    const vv = vx * vx + vy * vy;

    if (vv === 0) {
        return {
            t: 0,
            projected: { x: start.x, y: start.y },
            perpendicularDistance: distance(point, start),
        };
    }

    const t = clamp((wx * vx + wy * vy) / vv, 0, 1);
    const projected = {
        x: start.x + vx * t,
        y: start.y + vy * t,
    };

    return {
        t,
        projected,
        perpendicularDistance: distance(point, projected),
    };
}

function scoreFromDistance(error, tolerance) {
    if (tolerance <= 0) {
        return error <= 0 ? 100 : 0;
    }
    const ratio = clamp(error / tolerance, 0, 1);
    return Math.round((1 - ratio) * 100);
}

function mean(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export const vector_path = new p5((sketch) => {
    sketch.name = "vector_path";
    sketch.activated = false;

    let ballsData = [];
    let detectorFps = "0";

    let trackedBall = null;
    let previousTrackedBall = null;
    let trackingLostFrames = 0;
    let stableAnchorStart = 0;

    let state = "waiting_ball"; // waiting_ball -> preview -> playing -> result
    let challenge = null;
    let path = [];
    let movingStartedAt = 0;
    let stoppedSince = 0;
    let result = null;
    let resultShownAt = 0;
    let message = "Place une seule boule blanche sur la table.";

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;

        socket.on("vector_path-balls", (data) => {
            ballsData = Array.isArray(data)
                ? data.map((ball) => ({ x: ball[0], y: ball[1] }))
                : [];
        });

        socket.on("vector_path-fps", (data) => {
            detectorFps = data ?? "0";
        });
    };

    sketch.resume = () => {};
    sketch.pause = () => {};

    sketch.windowResized = () =>
        sketch.resizeCanvas(window.innerWidth, window.innerHeight);

    sketch.keyPressed = () => {
        if (sketch.key === "r" || sketch.key === "R") {
            resetRound(true);
        }
        if (sketch.key === "n" || sketch.key === "N") {
            if (trackedBall) {
                buildChallengeFromBall(trackedBall);
            }
        }
    };

    sketch.update = () => {
        updateTrackedBall();

        if (!trackedBall) {
            state = "waiting_ball";
            challenge = null;
            path = [];
            result = null;
            message = "Place une boule détectée au centre de la table pour démarrer.";
            return;
        }

        if (state === "waiting_ball") {
            const isStable = updateStableAnchor();
            message = isStable
                ? "Boule détectée. Génération du vecteur cible..."
                : "Ne touche plus la boule : stabilisation en cours.";

            if (isStable) {
                buildChallengeFromBall(trackedBall);
            }
            return;
        }

        if (state === "preview") {
            message = "Tire la boule en suivant le couloir et vise l’extrémité de la flèche.";
            const distanceFromOrigin = distance(trackedBall, challenge.origin);
            if (distanceFromOrigin > MOVEMENT_START_THRESHOLD) {
                state = "playing";
                movingStartedAt = sketch.millis();
                path = [
                    { x: challenge.origin.x, y: challenge.origin.y },
                    { x: trackedBall.x, y: trackedBall.y },
                ];
            }
            return;
        }

        if (state === "playing") {
            if (!path.length || distance(path[path.length - 1], trackedBall) > 3) {
                path.push({ x: trackedBall.x, y: trackedBall.y });
            }

            const stepDistance = previousTrackedBall
                ? distance(trackedBall, previousTrackedBall)
                : 0;

            if (stepDistance < MOVEMENT_STOP_THRESHOLD) {
                if (stoppedSince === 0) {
                    stoppedSince = sketch.millis();
                } else if (sketch.millis() - stoppedSince > 450) {
                    finishRound();
                }
            } else {
                stoppedSince = 0;
            }
            return;
        }

        if (state === "result") {
            message = "Appuie sur R pour relancer, ou attends la prochaine stabilisation.";
            if (sketch.millis() - resultShownAt > RESULT_TIME_MS) {
                resetRound(false);
            }
        }
    };

    function resetRound(forceRegenerate) {
        path = [];
        result = null;
        stoppedSince = 0;
        movingStartedAt = 0;

        if (!trackedBall) {
            state = "waiting_ball";
            challenge = null;
            return;
        }

        if (forceRegenerate) {
            buildChallengeFromBall(trackedBall);
        } else {
            state = "waiting_ball";
            challenge = null;
            stableAnchorStart = sketch.millis();
        }
    }

    function updateStableAnchor() {
        if (!trackedBall) {
            stableAnchorStart = 0;
            return false;
        }

        if (
            !previousTrackedBall ||
            distance(trackedBall, previousTrackedBall) < MOVEMENT_STOP_THRESHOLD
        ) {
            if (stableAnchorStart === 0) {
                stableAnchorStart = sketch.millis();
            }
        } else {
            stableAnchorStart = sketch.millis();
        }

        return (
            stableAnchorStart !== 0 &&
            sketch.millis() - stableAnchorStart > STABLE_TIME_MS
        );
    }

    function pickBestBall(candidates) {
        if (!candidates.length) return null;

        if (trackedBall) {
            let nearest = null;
            let nearestDistance = Infinity;

            for (const ball of candidates) {
                const d = distance(ball, trackedBall);
                if (d < nearestDistance) {
                    nearestDistance = d;
                    nearest = ball;
                }
            }

            if (nearest && nearestDistance <= MAX_TRACK_DISTANCE) {
                return nearest;
            }
        }

        const center = { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2 };
        let best = candidates[0];
        let bestDistance = distance(candidates[0], center);

        for (const ball of candidates.slice(1)) {
            const d = distance(ball, center);
            if (d < bestDistance) {
                best = ball;
                bestDistance = d;
            }
        }

        return best;
    }

    function updateTrackedBall() {
        previousTrackedBall = trackedBall ? { ...trackedBall } : null;

        const candidate = pickBestBall(ballsData);
        if (!candidate) {
            trackingLostFrames += 1;
            if (trackingLostFrames > 6) {
                trackedBall = null;
            }
            return;
        }

        trackingLostFrames = 0;

        if (!trackedBall) {
            trackedBall = { ...candidate };
            return;
        }

        trackedBall = {
            x: lerp(trackedBall.x, candidate.x, 0.55),
            y: lerp(trackedBall.y, candidate.y, 0.55),
        };
    }

    function buildChallengeFromBall(ball) {
        const origin = { x: ball.x, y: ball.y };
        const maxAvailableLength = computeMaxLengthFromOrigin(origin);
        const length = clamp(
            sketch.random(MIN_CHALLENGE_LENGTH, MAX_CHALLENGE_LENGTH),
            MIN_CHALLENGE_LENGTH,
            maxAvailableLength
        );

        const allowedAngles = [
            0,
            sketch.PI / 6,
            sketch.PI / 4,
            sketch.PI / 3,
            sketch.PI / 2,
            (2 * sketch.PI) / 3,
            (3 * sketch.PI) / 4,
            (5 * sketch.PI) / 6,
            sketch.PI,
            (7 * sketch.PI) / 6,
            (5 * sketch.PI) / 4,
            (4 * sketch.PI) / 3,
            (3 * sketch.PI) / 2,
            (5 * sketch.PI) / 3,
            (7 * sketch.PI) / 4,
            (11 * sketch.PI) / 6,
        ];

        let direction = 0;
        let end = origin;
        let attempts = 0;

        do {
            direction = randomChoice(sketch, allowedAngles);
            end = {
                x: origin.x + Math.cos(direction) * length,
                y: origin.y + Math.sin(direction) * length,
            };
            attempts += 1;
        } while (!pointInsidePlayableArea(end) && attempts < 40);

        if (!pointInsidePlayableArea(end)) {
            const fallbackAngle = Math.atan2(
                TABLE_HEIGHT / 2 - origin.y,
                TABLE_WIDTH / 2 - origin.x
            );

            direction = fallbackAngle;
            end = {
                x: clamp(
                    origin.x + Math.cos(direction) * length,
                    TABLE_MARGIN,
                    TABLE_WIDTH - TABLE_MARGIN
                ),
                y: clamp(
                    origin.y + Math.sin(direction) * length,
                    TABLE_MARGIN,
                    TABLE_HEIGHT - TABLE_MARGIN
                ),
            };
        }

        challenge = {
            origin,
            end,
            direction,
            corridorWidth: CORRIDOR_WIDTH_EASY,
            length: distance(origin, end),
        };

        state = "preview";
        path = [];
        result = null;
        stoppedSince = 0;
        movingStartedAt = 0;
        stableAnchorStart = sketch.millis();
    }

    function pointInsidePlayableArea(point) {
        return (
            point.x >= TABLE_MARGIN &&
            point.x <= TABLE_WIDTH - TABLE_MARGIN &&
            point.y >= TABLE_MARGIN &&
            point.y <= TABLE_HEIGHT - TABLE_MARGIN
        );
    }

    function computeMaxLengthFromOrigin(origin) {
        return Math.max(
            MIN_CHALLENGE_LENGTH,
            Math.min(
                MAX_CHALLENGE_LENGTH,
                origin.x - TABLE_MARGIN,
                TABLE_WIDTH - TABLE_MARGIN - origin.x,
                origin.y - TABLE_MARGIN,
                TABLE_HEIGHT - TABLE_MARGIN - origin.y
            ) * 1.8
        );
    }

    function finishRound() {
        if (!challenge || !trackedBall) {
            return;
        }

        if (!path.length) {
            path = [{ ...challenge.origin }, { ...trackedBall }];
        }

        const samples =
            path.length > 1 ? path : [{ ...challenge.origin }, { ...trackedBall }];

        const projections = samples.map((point) =>
            pointOnSegmentProjection(point, challenge.origin, challenge.end)
        );

        const averageLateralError = mean(
            projections.map((item) => item.perpendicularDistance)
        );

        const inCorridorRatio =
            projections.filter(
                (item) => item.perpendicularDistance <= challenge.corridorWidth / 2
            ).length / projections.length;

        const endError = distance(trackedBall, challenge.end);
        const progress = projections.length
            ? Math.max(...projections.map((item) => item.t))
            : 0;

        let trajectoryScore = scoreFromDistance(
            averageLateralError,
            challenge.corridorWidth / 2
        );

        trajectoryScore = Math.round(
            trajectoryScore * (0.5 + 0.5 * inCorridorRatio) * progress
        );

        const arrivalScore = scoreFromDistance(
            endError,
            Math.max(80, challenge.corridorWidth)
        );

        const total = Math.round(trajectoryScore * 0.6 + arrivalScore * 0.4);

        result = {
            trajectoryScore,
            arrivalScore,
            total,
            averageLateralError: Math.round(averageLateralError),
            endError: Math.round(endError),
            progress: Math.round(progress * 100),
            finalPosition: { ...trackedBall },
        };

        state = "result";
        resultShownAt = sketch.millis();
    }

    function drawArrow(start, end, color, weight = 8) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowSize = 26;

        sketch.push();
        sketch.stroke(color[0], color[1], color[2]);
        sketch.strokeWeight(weight);
        sketch.line(start.x, start.y, end.x, end.y);
        sketch.translate(end.x, end.y);
        sketch.rotate(angle);
        sketch.line(0, 0, -arrowSize, -arrowSize * 0.55);
        sketch.line(0, 0, -arrowSize, arrowSize * 0.55);
        sketch.pop();
    }

    function drawCorridor() {
        if (!challenge) return;

        const dx = challenge.end.x - challenge.origin.x;
        const dy = challenge.end.y - challenge.origin.y;
        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const nx = -dy / len;
        const ny = dx / len;
        const half = challenge.corridorWidth / 2;

        const p1 = {
            x: challenge.origin.x + nx * half,
            y: challenge.origin.y + ny * half,
        };
        const p2 = {
            x: challenge.end.x + nx * half,
            y: challenge.end.y + ny * half,
        };
        const p3 = {
            x: challenge.end.x - nx * half,
            y: challenge.end.y - ny * half,
        };
        const p4 = {
            x: challenge.origin.x - nx * half,
            y: challenge.origin.y - ny * half,
        };

        sketch.push();
        sketch.noStroke();
        sketch.fill(51, 207, 255, 35);
        sketch.beginShape();
        sketch.vertex(p1.x, p1.y);
        sketch.vertex(p2.x, p2.y);
        sketch.vertex(p3.x, p3.y);
        sketch.vertex(p4.x, p4.y);
        sketch.endShape(sketch.CLOSE);
        sketch.pop();
    }

    function drawPath() {
        if (!path.length) return;

        sketch.push();
        sketch.noFill();
        sketch.stroke(255, 92, 92);
        sketch.strokeWeight(7);
        sketch.beginShape();
        for (const point of path) {
            sketch.vertex(point.x, point.y);
        }
        sketch.endShape();
        sketch.pop();
    }

    function drawBalls() {
        for (const ball of ballsData) {
            const isTracked =
                trackedBall && distance(ball, trackedBall) < BALL_RADIUS * 1.2;

            sketch.push();
            sketch.stroke(
                isTracked
                    ? sketch.color(255, 255, 255)
                    : sketch.color(255, 255, 255, 120)
            );
            sketch.strokeWeight(isTracked ? 6 : 3);
            sketch.noFill();
            sketch.circle(ball.x, ball.y, BALL_RADIUS * 2);
            sketch.pop();
        }
    }

    function drawStatusPanel() {
        sketch.push();
        sketch.fill(0, 0, 0, 170);
        sketch.noStroke();
        sketch.rect(35, 35, 650, 215, 18);

        sketch.fill(255);
        sketch.textSize(28);
        sketch.textAlign(sketch.LEFT, sketch.TOP);
        sketch.text("Exercice vecteur — suivre un vecteur cible", 60, 55);

        sketch.textSize(18);
        sketch.fill(230);
        sketch.text(message, 60, 100, 600, 60);
        sketch.text(
            `Détection boules : ${Math.round(Number(detectorFps) || 0)} FPS`,
            60,
            155
        );
        sketch.text("R : relancer   •   N : nouveau vecteur", 60, 185);

        if (result) {
            sketch.textAlign(sketch.RIGHT, sketch.TOP);
            sketch.textSize(48);
            sketch.fill(
                result.total >= 75
                    ? sketch.color(90, 255, 140)
                    : result.total >= 45
                    ? sketch.color(255, 215, 90)
                    : sketch.color(255, 120, 120)
            );
            sketch.text(`${result.total}/100`, 655, 58);

            sketch.textAlign(sketch.LEFT, sketch.TOP);
            sketch.textSize(18);
            sketch.fill(255);
            sketch.text(`Trajectoire : ${result.trajectoryScore}/100`, 360, 145);
            sketch.text(`Arrivée : ${result.arrivalScore}/100`, 360, 170);
            sketch.text(`Écart fin : ${result.endError}px`, 360, 195);
        }

        sketch.pop();
    }

    function drawTargetMarkers() {
        if (!challenge) return;

        sketch.push();
        sketch.noFill();
        sketch.stroke(90, 255, 140);
        sketch.strokeWeight(4);
        sketch.circle(challenge.origin.x, challenge.origin.y, BALL_RADIUS * 2 + 12);
        sketch.circle(challenge.end.x, challenge.end.y, 40);
        sketch.circle(challenge.end.x, challenge.end.y, 90);
        sketch.pop();
    }

    sketch.show = () => {
        sketch.clear();

        drawBalls();

        if (challenge) {
            drawCorridor();
            drawArrow(challenge.origin, challenge.end, [51, 207, 255], 8);
            drawTargetMarkers();
        }

        drawPath();

        if (result?.finalPosition) {
            sketch.push();
            sketch.noStroke();
            sketch.fill(255, 92, 92);
            sketch.circle(result.finalPosition.x, result.finalPosition.y, 18);
            sketch.pop();
        }

        drawStatusPanel();
    };
});