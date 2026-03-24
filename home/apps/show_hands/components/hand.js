let hand_junctions = [
    [
        [0, 1],
        [0, 5],
        [0, 9],
        [0, 13],
        [0, 17],
        [5, 9],
        [9, 13],
        [13, 17],
    ],
    [
        [1, 2],
        [2, 3],
        [3, 4]
    ],
    [
        [5, 6],
        [6, 7],
        [7, 8]
    ],
    [
        [9, 10],
        [10, 11],
        [11, 12]
    ],
    [
        [13, 14],
        [14, 15],
        [15, 16]
    ],
    [
        [17, 18],
        [18, 19],
        [19, 20]
    ]
]

export function display_hand(sketch, hand_pose, handedness, show_hands_points, show_hands_lines) {
    if (hand_pose == undefined) return;
    if (hand_pose.length != 21) return;
    sketch.push();
    // sketch.circle(960, 540, 60);

    const HANDS_FLIP_X = false;
    const HANDS_FLIP_Y = false;
    const toCanvas = (pt) => {
        const nx = HANDS_FLIP_X ? (1 - pt[0]) : pt[0];
        const ny = HANDS_FLIP_Y ? (1 - pt[1]) : pt[1];
        return [nx * sketch.width - sketch.width / 2, ny * sketch.height - sketch.height / 2];
    };

    sketch.fill(255,0,255);
    // console.log(hand_pose);
    if (show_hands_points) {
        for (let i = 0; i < hand_pose.length; i++) {
            const [x, y] = toCanvas(hand_pose[i]);
            sketch.ellipse(
                x,
                y,
                10
            );
        }
    }

    sketch.stroke(255, 0,255);
    sketch.strokeWeight(4);
    if (
        show_hands_lines &&
        hand_pose.length == 21
    ) {
        hand_junctions.forEach(parts => {
            parts.forEach(pair => {
                const [x1, y1] = toCanvas(hand_pose[pair[0]]);
                const [x2, y2] = toCanvas(hand_pose[pair[1]]);
                sketch.line(
                    x1,
                    y1,
                    x2,
                    y2
                );
            })
        })
    }
    // console.log(handedness);
    sketch.fill(255);
    sketch.noStroke();
    if (
        handedness != undefined && handedness.length > 0
    ) {
        const [hx, hy] = toCanvas(hand_pose[0]);
        sketch.textSize(32);
        sketch.text(handedness[1], hx, hy + 40);
        sketch.textSize(16);
        sketch.text(handedness[2], hx, hy + 65);
    }

    // if (
    //     sign != undefined && sign.length > 0
    // ) {
    //     sketch.textSize(32);
    //     sketch.text(sign[0], hand_pose[0][0] * sketch.width, 120 + hand_pose[0][1] * sketch.height);
    //     sketch.textSize(16);
    //     sketch.text(sign[1], hand_pose[0][0] * sketch.width, 145 + hand_pose[0][1] * sketch.height);
    // }

    sketch.pop();
}
