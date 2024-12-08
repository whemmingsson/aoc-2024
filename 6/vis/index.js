
let matrix = [];
const cellSize = 10;
const pos = { r: 0, c: 0 };
const direction = { r: -1, c: 0 };
const speed = 10;

function setup() {
    createCanvas(130 * cellSize, 130 * cellSize);

    // Parse data

    matrix = [];
    const rows = data.split("\n");

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        matrix.push(row.split(""));
        if (row.indexOf("^") >= 0) {
            pos.r = i;
            pos.c = row.indexOf("^");
        }
    }
    drawMap();
}

function draw() {
    for (let i = 0; i < speed; i++) {
        const didMove = move();
        if (!didMove) {
            break;
        }

        drawPos();
    }
}

function turn90DegRight() {
    const { r, c } = direction;
    direction.r = c;
    direction.c = -r;
}

function isObstacleInFront() {
    const { r, c } = direction;
    const nextR = pos.r + r;
    const nextC = pos.c + c;
    return matrix[nextR] && matrix[nextR][nextC] === "#";
}

function outOfBounds() {
    return (
        pos.r < 0 ||
        pos.r >= matrix.length ||
        pos.c < 0 ||
        pos.c >= matrix[0].length
    );
}

let visitedCells = 0;

function move() {

    if (outOfBounds()) {
        console.log("Out of bounds");
        console.log("Visited cells: ", visitedCells + 1);
        noLoop();
        return false;
    }

    if (!isObstacleInFront()) {
        pos.r += direction.r;
        pos.c += direction.c;

        if (matrix[pos.r] && matrix[pos.r][pos.c] === ".") {
            visitedCells++;
        }

        if (matrix[pos.r]) {
            matrix[pos.r][pos.c] = "X";
        }
    } else {
        turn90DegRight();
    }

    return true;
}

function drawPos() {
    fill(255, 0, 0);
    rect(pos.c * cellSize, pos.r * cellSize, cellSize, cellSize);
}

function drawMap() {
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            const cell = matrix[r][c];
            if (cell === "#") {
                fill(0);
            } else if (r === pos.r && c === pos.c) {
                fill(255, 0, 0);
            } else {
                fill(255);
            }

            rect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
    }
}