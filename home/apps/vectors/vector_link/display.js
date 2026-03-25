import {
    VECTOR_THEME,
    drawArrow,
    drawBallLabel,
    drawBallOutline,
    drawHeaderBadge,
    drawStatusPanel,
    drawTargetRings,
} from "./components/ui.js";

const TABLE_WIDTH = 1920;
const TABLE_HEIGHT = 1080;
const TABLE_MARGIN = 120;
const BALL_RADIUS = 34;
const TARGET_RADIUS = 40;
const STABLE_TIME_MS = 900;
const RESULT_TIME_MS = 3500;
const TRACK_LOCK_DISTANCE = 150;
const MOVE_START_DISTANCE = 18;
const STOP_THRESHOLD = 4;
const TARGET_TOLERANCE = 70;
const MIN_VECTOR_LENGTH = 220;
const MAX_VECTOR_LENGTH = 620;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function angleBetween(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const n1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const n2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (n1 === 0 || n2 === 0) return Math.PI;

    return Math.acos(clamp(dot / (n1 * n2), -1, 1));
}

function scoreFromError(error, tolerance) {
    if (tolerance <= 0) return error === 0 ? 100 : 0;
    return Math.round((1 - clamp(error / tolerance, 0, 1)) * 100);
}

function chooseAnchorBall(balls) {
    const center = { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2 };
    let best = balls[0];
    let bestDistance = distance(best, center);

    for (const ball of balls.slice(1)) {
        const d = distance(ball, center);
        if (d < bestDistance) {
            best = ball;
            bestDistance = d;
        }
    }

    return { x: best.x, y: best.y };
}

function computeMaxLength(origin) {
    return Math.max(
        MIN_VECTOR_LENGTH,
        Math.min(
            MAX_VECTOR_LENGTH,
            origin.x - TABLE_MARGIN,
            TABLE_WIDTH - TABLE_MARGIN - origin.x,
            origin.y - TABLE_MARGIN,
            TABLE_HEIGHT - TABLE_MARGIN - origin.y
        ) * 1.8
    );
}

function pointInsideTable(point) {
    return (
        point.x >= TABLE_MARGIN &&
        point.x <= TABLE_WIDTH - TABLE_MARGIN &&
        point.y >= TABLE_MARGIN &&
        point.y <= TABLE_HEIGHT - TABLE_MARGIN
    );
}

export const vector_link = new p5((sketch) => {
    sketch.name = "vector_link";
    sketch.activated = false;

    let ballsData = [];
    let detectorFps = "0";
    let uiFont = null;

    let state = "waiting_two_balls";
    let message = "Place deux boules sur la table pour construire le vecteur AB.";

    let anchorBall = null;
    let trackedBall = null;
    let previousTrackedBall = null;
    let trackingLostFrames = 0;
    let stableSince = 0;
    let movedEnough = false;

    let challenge = null;
    let result = null;
    let resultShownAt = 0;

    sketch.preload = () => {
        uiFont = loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;

        socket.on("vector_link-balls", (data) => {
            ballsData = Array.isArray(data)
                ? data.map((ball) => ({ x: ball[0], y: ball[1] }))
                : [];
        });

        socket.on("vector_link-fps", (data) => {
            detectorFps = data ?? "0";
        });
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.windowResized = () => sketch.resizeCanvas(window.innerWidth, window.innerHeight);

    sketch.keyPressed = () => {
        if (sketch.key === "r" || sketch.key === "R") {
            resetRound(true);
        }
        if (sketch.key === "n" || sketch.key === "N") {
            if (anchorBall) {
                buildChallenge(anchorBall);
            }
        }
    };

    sketch.update = () => {
        updateTrackedBalls();

        if (ballsData.length < 2 || !anchorBall || !trackedBall) {
            state = "waiting_two_balls";
            challenge = null;
            result = null;
            movedEnough = false;
            stableSince = 0;
            message = "Place deux boules visibles et stables sur la table.";
            return;
        }

        if (state === "waiting_two_balls") {
            if (areBallsStable()) {
                buildChallenge(anchorBall);
            } else {
                message = "Ne touche plus aux deux boules : stabilisation en cours.";
            }
            return;
        }

        if (state === "preview") {
            message = "Déplace la boule B jusqu’à l’extrémité de la flèche affichée depuis A.";

            if (distance(trackedBall, challenge.initialBallB) > MOVE_START_DISTANCE) {
                movedEnough = true;
                state = "solving";
                stableSince = 0;
            }
            return;
        }

        if (state === "solving") {
            const stepDistance = previousTrackedBall ? distance(trackedBall, previousTrackedBall) : 0;

            if (stepDistance < STOP_THRESHOLD) {
                if (stableSince === 0) {
                    stableSince = sketch.millis();
                } else if (sketch.millis() - stableSince > STABLE_TIME_MS && movedEnough) {
                    evaluateRound();
                }
            } else {
                stableSince = 0;
            }
            return;
        }

        if (state === "result") {
            message = "Score affiché. Attends la prochaine stabilisation ou appuie sur N/R pour debug.";
            if (sketch.millis() - resultShownAt > RESULT_TIME_MS) {
                resetRound(false);
            }
        }
    };

    function resetRound(forceRegenerate) {
        result = null;
        movedEnough = false;
        stableSince = 0;

        if (ballsData.length < 2 || !anchorBall) {
            state = "waiting_two_balls";
            challenge = null;
            return;
        }

        if (forceRegenerate) {
            buildChallenge(anchorBall);
        } else {
            state = "waiting_two_balls";
            challenge = null;
        }
    }

    function areBallsStable() {
        if (!anchorBall || !trackedBall || !previousTrackedBall) {
            stableSince = 0;
            return false;
        }

        const currentA = anchorBall;
        const currentB = trackedBall;
        const previousB = previousTrackedBall;

        const currentAData = ballsData.find((ball) => distance(ball, currentA) < TRACK_LOCK_DISTANCE);
        const aDelta = currentAData ? distance(currentAData, currentA) : TRACK_LOCK_DISTANCE;
        const bDelta = distance(currentB, previousB);

        if (aDelta < STOP_THRESHOLD && bDelta < STOP_THRESHOLD) {
            if (stableSince === 0) {
                stableSince = sketch.millis();
            }
            return sketch.millis() - stableSince > STABLE_TIME_MS;
        }

        stableSince = 0;
        return false;
    }

    function updateTrackedBalls() {
        previousTrackedBall = trackedBall ? { ...trackedBall } : null;

        if (ballsData.length < 2) {
            anchorBall = null;
            trackedBall = null;
            trackingLostFrames += 1;
            return;
        }

        if (!anchorBall) {
            anchorBall = chooseAnchorBall(ballsData);
        } else {
            const nearestToAnchor = ballsData.reduce((best, ball) => {
                if (!best) return ball;
                return distance(ball, anchorBall) < distance(best, anchorBall) ? ball : best;
            }, null);

            if (nearestToAnchor && distance(nearestToAnchor, anchorBall) < TRACK_LOCK_DISTANCE) {
                anchorBall = {
                    x: lerp(anchorBall.x, nearestToAnchor.x, 0.35),
                    y: lerp(anchorBall.y, nearestToAnchor.y, 0.35),
                };
            }
        }

        const candidatesB = ballsData
            .filter((ball) => distance(ball, anchorBall) > BALL_RADIUS * 1.2)
            .sort((a, b) => distance(a, anchorBall) - distance(b, anchorBall));

        const bestB = trackedBall
            ? candidatesB.reduce((best, ball) => {
                  if (!best) return ball;
                  return distance(ball, trackedBall) < distance(best, trackedBall) ? ball : best;
              }, null)
            : candidatesB[0];

        if (!bestB) {
            trackingLostFrames += 1;
            if (trackingLostFrames > 8) {
                trackedBall = null;
            }
            return;
        }

        trackingLostFrames = 0;
        if (!trackedBall) {
            trackedBall = { ...bestB };
        } else {
            trackedBall = {
                x: lerp(trackedBall.x, bestB.x, 0.45),
                y: lerp(trackedBall.y, bestB.y, 0.45),
            };
        }
    }

    function buildChallenge(origin) {
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

        const maxLength = computeMaxLength(origin);
        const length = clamp(sketch.random(MIN_VECTOR_LENGTH, MAX_VECTOR_LENGTH), MIN_VECTOR_LENGTH, maxLength);

        let attempts = 0;
        let angle = 0;
        let end = { ...origin };

        do {
            angle = allowedAngles[Math.floor(sketch.random(allowedAngles.length))];
            end = {
                x: origin.x + Math.cos(angle) * length,
                y: origin.y + Math.sin(angle) * length,
            };
            attempts += 1;
        } while (!pointInsideTable(end) && attempts < 40);

        if (!pointInsideTable(end)) {
            angle = Math.atan2(TABLE_HEIGHT / 2 - origin.y, TABLE_WIDTH / 2 - origin.x);
            end = {
                x: clamp(origin.x + Math.cos(angle) * length, TABLE_MARGIN, TABLE_WIDTH - TABLE_MARGIN),
                y: clamp(origin.y + Math.sin(angle) * length, TABLE_MARGIN, TABLE_HEIGHT - TABLE_MARGIN),
            };
        }

        challenge = {
            origin: { ...origin },
            end,
            length: distance(origin, end),
            angle,
            initialBallB: trackedBall ? { ...trackedBall } : { ...origin },
        };

        state = "preview";
        result = null;
        movedEnough = false;
        stableSince = 0;
    }

    function evaluateRound() {
        if (!challenge || !trackedBall) return;

        const targetVector = {
            x: challenge.end.x - challenge.origin.x,
            y: challenge.end.y - challenge.origin.y,
        };
        const actualVector = {
            x: trackedBall.x - challenge.origin.x,
            y: trackedBall.y - challenge.origin.y,
        };

        const endError = distance(trackedBall, challenge.end);
        const angleError = angleBetween(targetVector, actualVector) * (180 / Math.PI);
        const normError = Math.abs(
            Math.sqrt(actualVector.x * actualVector.x + actualVector.y * actualVector.y) - challenge.length
        );

        const endpointScore = scoreFromError(endError, TARGET_TOLERANCE);
        const directionScore = scoreFromError(angleError, 25);
        const lengthScore = scoreFromError(normError, 120);
        const total = Math.round(endpointScore * 0.5 + directionScore * 0.3 + lengthScore * 0.2);

        result = {
            endpointScore,
            directionScore,
            lengthScore,
            total,
            endError: Math.round(endError),
            angleError: Math.round(angleError),
            normError: Math.round(normError),
            finalBallB: { ...trackedBall },
        };

        state = "result";
        resultShownAt = sketch.millis();
    }

    function scoreColor(total) {
        if (total >= 75) return VECTOR_THEME.green;
        if (total >= 45) return VECTOR_THEME.yellow;
        return VECTOR_THEME.red;
    }

    function drawBalls() {
        for (const ball of ballsData) {
            const isAnchor = anchorBall && distance(ball, anchorBall) < BALL_RADIUS * 1.2;
            const isTracked = trackedBall && distance(ball, trackedBall) < BALL_RADIUS * 1.2;

            if (isAnchor) {
                drawBallOutline(sketch, ball.x, ball.y, BALL_RADIUS, VECTOR_THEME.green, 6);
            } else if (isTracked) {
                drawBallOutline(sketch, ball.x, ball.y, BALL_RADIUS, VECTOR_THEME.red, 6);
            } else {
                drawBallOutline(sketch, ball.x, ball.y, BALL_RADIUS, VECTOR_THEME.whiteBall, 3, 120);
            }
        }

        if (anchorBall) {
            drawBallLabel(sketch, anchorBall.x, anchorBall.y, "A", VECTOR_THEME.green);
        }
        if (trackedBall) {
            drawBallLabel(sketch, trackedBall.x, trackedBall.y, "B", VECTOR_THEME.red);
        }
    }

    function drawChallenge() {
        if (!challenge) return;

        drawTargetRings(sketch, challenge.end.x, challenge.end.y, VECTOR_THEME.cyan, [42, 76]);
        drawArrow(sketch, challenge.origin, challenge.end, [...VECTOR_THEME.cyan, 255], 8);

        if (trackedBall) {
            drawArrow(sketch, challenge.origin, trackedBall, [...VECTOR_THEME.red, 230], 5);
        }
    }

    function drawStatusPanelSafe() {
        const metrics = [
            `Détection des boules : ${Math.round(Number(detectorFps) || 0)} FPS`,
            "A = origine fixe   •   B = boule à déplacer",
            result ? `Écart cible : ${result.endError}px   •   Angle : ${result.angleError}°` : "Debug clavier : R relance la manche, N génère un nouveau vecteur.",
        ];

        drawStatusPanel(sketch, {
            x: 34,
            y: 34,
            w: 760,
            h: 252,
            title: "Vecteurs — Construire AB",
            subtitle: "Exercice de reproduction de vecteur",
            message,
            metrics,
            footer: result ? "Attends la prochaine stabilisation pour recommencer." : "Maintiens deux boules visibles pour lancer automatiquement un défi.",
            scoreText: result ? `${result.total}/100` : null,
            scoreColor: result ? scoreColor(result.total) : VECTOR_THEME.green,
        });

        drawHeaderBadge(sketch, TABLE_WIDTH - 250, 36, "Mode", "2 boules", VECTOR_THEME.cyan);
    }

    sketch.show = () => {
        sketch.clear();
        if (uiFont) sketch.textFont(uiFont);

        drawBalls();
        drawChallenge();
        drawStatusPanelSafe();
    };
});
