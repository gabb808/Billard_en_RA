import {
    testShow
} from "./states/test.js"
import {
    Balls
} from "./components/balls.js";
import {
    startShow, startReset
} from "./states/start.js"
import {
    curtainShow, curtainReset
} from "./states/curtain.js";
import {
    mediatriceLessonSegmentShow, mediatriceLessonSegmentReset
} from "./states/mediatriceLessonSegment.js"
import {
    mediatriceLessonTriangleShow, mediatriceLessonTriangleReset
} from "./states/mediatriceLessonTriangle.js"
import {
    mediatricePracticeSegmentShow, mediatricePracticeSegmentReset
} from "./states/mediatricePracticeSegment.js"
import {
    mediatricePracticeTriangleShow, mediatricePracticeTriangleReset
} from "./states/mediatricePracticeTriangle.js"
import {
    hauteurLessonInsideShow, hauteurLessonInsideReset
} from "./states/hauteurLessonInside.js"
import {
    hauteurLessonOutsideShow, hauteurLessonOutsideReset
} from "./states/hauteurLessonOutside.js"
import {
    hauteurPracticeBShow, hauteurPracticeBReset
} from "./states/hauteurPracticeB.js"
import {
    hauteurPracticeCShow, hauteurPracticeCReset
} from "./states/hauteurPracticeC.js"
import {
    rappelTrianglesIsocelesEquilaterauxShow, rappelTrianglesIsocelesEquilaterauxReset
} from "./states/rappelTrianglesIsocelesEquilateraux.js"
import {
    doMediatriceOnIsoceleShow, doMediatriceOnIsoceleReset
} from "./states/doMediatriceOnIsocele.js"
import {
    doHauteurOnIsoceleShow, doHauteurOnIsoceleReset
} from "./states/doHauteurOnIsocele.js"
import {
    mediatriceHauteurEquilateralShow, mediatriceHauteurEquilateralReset
} from "./states/mediatriceHauteurEquilateral.js"
import {
    recapitulatifShow, recapitulatifReset
} from "./states/recapitulatif.js"
import {
    challengeIntroductionShow, challengeIntroductionReset
} from "./states/challengeIntroduction.js"
import {
    countdownShow, countdownReset
} from "./states/countdown.js"
import {
    challengeShow,
    getNumberOfPoint,
    challengeReset
} from "./states/challenge.js"
import {
    challengeResultShow, challengeResultReset
} from "./states/challengeResult.js"

let audio
let bgAudio = new Audio("./platform/home/apps/triangles_full_lesson/assets/bg_music.wav");
let balls = new Balls();
let refreshCircleTrigger = 0;
let exitCircleTrigger = 0;
let audioEnded = false;
let startingTime = 0;
let globalTime = 0;
let once = true;
let challengePoints = 0;
let exit = false;
let firstRun = true;
let state = "start"

export const triangles_full_lesson = new p5((sketch) => {
    sketch.name = "triangles_full_lesson";
    sketch.activated = false;

    let f;

    sketch.preload = () => {
        f = loadFont("/gosai/pool/core/server/assets/FallingSky-JKwK.otf");
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);

        socket.on("applications_balls_positions", (data) => balls.update_data(data));
        sketch.emit = (name, data = undefined) => {
            if (data == undefined) socket.emit(name);
            else socket.emit(name, data);
        };
        sketch.activated = true;

        
    };

    sketch.resume = () => {
        firstRun = true;
    };
    sketch.pause = () => {};
    sketch.update = () => {
        balls.update();
    };

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        firstRun ? onEnter() : null
        sketch.clear();

        exit_button(sketch, balls, f);

        sketch.fill(0);

        sketch.push();

        sketch.translate(width, height)
        sketch.rotate(sketch.PI);

        //debug: show table boundaries
        sketch.stroke(255)
        sketch.line(0, 0, sketch.width, 0)
        sketch.line(0, 0, 0, sketch.height)
        sketch.line(0, sketch.height, sketch.width, sketch.height)
        sketch.line(sketch.width, 0, sketch.width, sketch.height)

        // Background Audio
        bgAudio.loop = true;

        // state machine
        switch (state) {
            case "test":
                state = testShow(sketch, f, balls);
                break;
            case "start":
                state = startShow(sketch, f, balls);
                break;
            case "introduction":
                audioSlowlyDecreaseToPause();
                state = curtainShow(sketch, f, true);
                break;
            case "mediatriceLessonSegment":
                state = mediatriceLessonSegmentShow(sketch, f);
                break;
            case "mediatriceLessonTriangle":
                state = mediatriceLessonTriangleShow(sketch, f);
                break;
            case "mediatricePracticeSegment":
                state = mediatricePracticeSegmentShow(sketch, f, balls);
                break;
            case "mediatricePracticeTriangle":
                state = mediatricePracticeTriangleShow(sketch, f, balls);
                break;
            case "hauteurLessonInside":
                state = hauteurLessonInsideShow(sketch, f);
                break;
            case "hauteurLessonOutside":
                state = hauteurLessonOutsideShow(sketch, f, balls);
                break;
            case "hauteurPracticeB":
                state = hauteurPracticeBShow(sketch, f, balls);
                break;
            case "hauteurPracticeC":
                state = hauteurPracticeCShow(sketch, f, balls);
                break;
            case "rappelTrianglesIsocelesEquilateraux":
                state = rappelTrianglesIsocelesEquilaterauxShow(sketch, f, balls);
                break;
            case "doMediatriceOnIsocele":
                state = doMediatriceOnIsoceleShow(sketch, f, balls);
                break;
            case "doHauteurOnIsocele":
                state = doHauteurOnIsoceleShow(sketch, f, balls);
                break;
            case "mediatriceHauteurEquilateral":
                state = mediatriceHauteurEquilateralShow(sketch, f);
                break;
            case "recapitulatif":
                state = recapitulatifShow(sketch, f);
                break;
            case "challengeIntroduction":
                state = challengeIntroductionShow(sketch, f, balls);
                break;
            case "countdown":
                state = countdownShow(sketch, f);
                break;
            case "challenge":
                state = challengeShow(sketch, f, balls);
                break;
            case "challengeResult":
                state = challengeResultShow(sketch, f, balls);
                break;
            case "outro":
                state = curtainShow(sketch, f, false);
                bgAudio.volume = 0.3;
                bgAudio.play();

                break;
            case "end":
                audioSlowlyDecreaseToPause();
                if (once) {
                    once = false;
                    globalTime = millis() - startingTime;
                    challengePoints = getNumberOfPoint();
                    globalTime = globalTime / 1000;
                    globalTime = Math.round(globalTime * 100) / 100;
                }
                sketch.stroke(255)
                sketch.fill(255);
                sketch.textFont(f, 70);
                sketch.textAlign(sketch.CENTER)
                sketch.text("Merci d'avoir joué !", sketch.width / 2, sketch.height / 2);
                sketch.text("Vous avez gagné " + challengePoints + " points !", sketch.width / 2, sketch.height / 2 + 100);
                sketch.text("Votre temps global est de " + globalTime + " s", sketch.width / 2, sketch.height / 2 + 200);
                if (millis() - globalTime > 10000) {
                    goBackToMenu(sketch);
                }
                break;
            default:
                break;
        }
        sketch.pop();
    };
});

function onEnter() {
    firstRun = false;
    resetAll()

    state = "start"
    bgAudio.currentTime = 0;
    bgAudio.volume = 0.2;
    bgAudio.play();

    startingTime = millis();
    exit = true;

    // todo: change this quick fix in a better way in another file
    try {

        document.getElementById("open_gif").style.visibility = "hidden";
        document.getElementById("close_gif").style.visibility = "hidden";
    } catch (e) {
        console.log(e)
    }
}

function audioSlowlyDecreaseToPause() {
    if (bgAudio.volume > 0.01) {
        bgAudio.volume -= 0.001;
    } else {
        bgAudio.pause();
    }
}

export let navBar = {
    showPlayPauseButton: function (sketch, pause) {
        sketch.push()
        sketch.translate(145, 900)

        sketch.stroke(255)
        sketch.strokeWeight(3)

        if (pause == true) {
            sketch.noFill()
            sketch.triangle(2, 0, 2, 30, 32, 15)
            sketch.fill(255, 200, 0);
        } else {
            sketch.fill(255)
            sketch.rect(0, 0, 11, 30)
            sketch.rect(19, 0, 11, 30)
            sketch.noFill()
        }
        sketch.circle(15, 15, 70)
        sketch.pop()
    },
    showRepeatButton: function (sketch, repeat) {
        sketch.push()
        sketch.translate(275, 900)
        sketch.scale(-1, 1)

        sketch.stroke(255)
        sketch.strokeWeight(3)
        sketch.noFill()
        sketch.circle(15, 15, 70)

        if (repeat == true && refreshCircleTrigger >= 0) {
            sketch.fill(255, 200, 0); // yellow
            sketch.circle(15, 15, 70 + refreshCircleTrigger)
            refreshCircleTrigger += 1
        }
        if (refreshCircleTrigger > 50) {
            refreshCircleTrigger = -1
        }
        if (repeat == false) {
            refreshCircleTrigger = 0
        }
        sketch.noFill()
        sketch.arc(15, 15, 33, 33, 0, radians(295))

        sketch.strokeWeight(0)
        sketch.fill(255)
        sketch.push()
        sketch.translate(15, 10)
        sketch.rotate(radians(-15))
        sketch.triangle(0, 0, 15, -15, 15, 0)
        sketch.pop()
        sketch.pop()
    },
    checkPauseButtons: function () {
        for (let i = 0; i < balls.balls.length; i++) {
            if (balls.balls[i].x < (width - 125) && balls.balls[i].x > (width - 195) && balls.balls[i].y < (height - 890) && balls.balls[i].y > (height - 960)) {
                return true
            }
        }
        return false
    },
    checkRepeatButtons: function () {
        for (let i = 0; i < balls.balls.length; i++) {
            if (balls.balls[i].x < (width - 220) && balls.balls[i].x > (width - 270) && balls.balls[i].y < (height - 890) && balls.balls[i].y > (height - 960)) {
                return true
            }
        }
        return false
    }
}

export let audioMedia = {
    playSound: function (sound) {
        audio = new Audio(sound);
        audio.volume = 1;
        audio.play();
    },
    pauseSound: function () {
        try {
            audio.pause();
        } catch (e) {
            console.log("No audio to pause")
        }
    },
    stopSound: function () {
        try {
            audio.currentTime = 0;
            audio.pause();
        } catch (e) {
            console.log("No audio to stop")
        }
    },
    resumeSound: function () {
        try {
            audio.play();
        } catch (e) {
            console.log("No audio to resume")
        }
    },
    restartSound: function () {
        try {
            audio.currentTime = 0;
            audio.play();
        } catch (e) {
            console.log("No audio to restart")
        }
    },
    checkIfAudioEnded: function () {
        audio.onended = function () {
            audioEnded = true;
        }
        if (audioEnded == true) {
            audioEnded = false;
            return true
        }
        return false
    },
    getAudioTime: function () {
        return audio.currentTime
    },
    setAudioVolume: function (volume) {
        audio.volume = volume
    }
}

function goBackToMenu(sketch) {
    if (exit) {
        exit = false;
        bgAudio.loop = false;
        bgAudio.pause();
        audioMedia.pauseSound();
        sketch.emit("core-app_manager-start_application", {
            application_name: "show_hands",
        });
        sketch.emit("core-app_manager-start_application", {
            application_name: "menu",
        });
        sketch.emit("core-app_manager-stop_application", {
            application_name: sketch.name,
        });
    }
}

function resetAll() {
    startReset();
    curtainReset();
    mediatriceLessonSegmentReset();
    mediatriceLessonTriangleReset();
    mediatricePracticeSegmentReset();
    mediatricePracticeTriangleReset();
    hauteurLessonInsideReset();
    hauteurLessonOutsideReset();
    hauteurPracticeBReset();
    hauteurPracticeCReset();
    rappelTrianglesIsocelesEquilaterauxReset();
    doMediatriceOnIsoceleReset();
    doHauteurOnIsoceleReset();
    mediatriceHauteurEquilateralReset();
    recapitulatifReset();
    challengeIntroductionReset();
    countdownReset();
    challengeReset();
    challengeResultReset();
}

function exit_button(sketch, balls, f) {
    let exitTrigger = false;
    for (let i = 0; i < balls.balls.length; i++) {

        if (balls.balls[i].x < (width - 100) && balls.balls[i].x > (width - 200) && balls.balls[i].y > (height - 300) && balls.balls[i].y < (height - 200))
        {
            exitTrigger = true;
        }

    }
    sketch.push()
    sketch.translate(width, height)
    sketch.rotate(sketch.PI);

    sketch.noFill()
    sketch.stroke(255)
    sketch.strokeWeight(3)
    sketch.circle(150, 250, 100)

    if (exitTrigger == true && exitCircleTrigger >= 0) {
        sketch.stroke(255, 200, 0); // yellow
        sketch.noFill()
        sketch.strokeWeight(12)
        sketch.arc(150, 250, 104, 104, 0, radians(exitCircleTrigger))
        exitCircleTrigger += 1
    }
    if (exitCircleTrigger > 360) {
        exitCircleTrigger = -1
        goBackToMenu(sketch)
    }
    if (exitTrigger == false) {
        exitCircleTrigger = 0
    }

    sketch.fill(255)
    sketch.textFont(f, 40);
    sketch.textAlign(sketch.CENTER, sketch.CENTER)
    sketch.text("Exit", 150, 245);
    sketch.pop()
}