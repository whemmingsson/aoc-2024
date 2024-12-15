const useExample = false; // Use simpler data
const render = true; // If false, the algoritm runs until completion without rendering

// Display variables
const cellSize = 15;
const speed = 10;

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1, d: "^" }, { x: 0, y: 1, d: "v" }, { x: -1, y: 0, d: "<" }, { x: 1, y: 0, d: ">" }];
let directionMap = {};
let map = [];
let instructions;
let robotPos;
let instructionIndex = 0;
let boxes = [];
let boxMap = {};

let size = useExample ? { w: 10, h: 10 } : { w: 50, h: 50 }

const createMap = () => {
    const m = [];
    (useExample ? data_map_example : data_map).split("\n").forEach((r, y) => {
        const row = [];
        const rowSplit = r.trim().split("");
        rowSplit.forEach((c, x) => {
            if (c === ".") {
                row.push(".");
                row.push(".");
            }
            else if (c === "#") {
                row.push("#");
                row.push("#");
            }
            else if (c === "O") {
                row.push("[");
                row.push("]");
            }
            else if (c === "@") {
                robotPos = {
                    x: x * 2, y
                }
                row.push("@");
                row.push(".");
            }
        })

        m.push(row);
    });

    return m;
}

const createInstructions = () => {
    const instructions = [];
    (useExample ? data_instructions_example : data_instructions).split("\n").forEach((r, i) => {
        const rowSplit = r.trim().split("");
        instructions.push(...rowSplit);
    });

    return instructions;
}

const createDirectionsMap = () => {
    let m = {};
    cardinalVectors.forEach(v => {
        m[v.d] = v;
    });
    return m;
}

const canMoveSimpleCase = (instr) => {
    const vector = directionMap[instr];
    const targetCell = map[robotPos.y + vector.y][robotPos.x + vector.x];
    if (targetCell === ".")
        return true;

    if (targetCell === "#")
        return false;

    return undefined;
}

const moveRobot = (instr) => {
    const originalPos = { x: robotPos.x, y: robotPos.y };
    const newPos = { x: robotPos.x += directionMap[instr].x, y: robotPos.y += directionMap[instr].y };
    robotPos.x = newPos.x;
    robotPos.y = newPos.y;
    map[newPos.y][newPos.x] = "@";
    map[originalPos.y][originalPos.x] = ".";
}

const executeInstruction = () => {
    const instruction = instructions[instructionIndex];
    const simpleMove = canMoveSimpleCase(instruction);
    if (simpleMove) {
        moveRobot(instruction);
    }
    else if (!(simpleMove !== undefined && !simpleMove)) {
        if (instruction === ">" || instruction === "<") {
            handleHorizontalMove(instruction);
        }
        else {
            handleVerticalMove(instruction);
        }
    }

    instructionIndex++;
}

const isBoxAt = (p) => {
    return map[p.y][p.x] === "[" || map[p.y][p.x] === "]";
}

const isWallAt = (p) => {
    return map[p.y][p.x] === "#";
}

let keyOf = (p) => {
    return p.x + "_" + p.y;
}

const handleHorizontalMove = (instr) => {
    const vector = directionMap[instr];
    let boxPos = { x: robotPos.x + vector.x, y: robotPos.y + vector.y }

    let cellsToShift = [];
    cellsToShift.push({ ...robotPos });
    while (isBoxAt(boxPos)) {
        cellsToShift.push({ ...boxPos });
        boxPos.x += vector.x;
        boxPos.y += vector.y;
    };

    if (isWallAt(boxPos)) {
        return;
    }

    for (let i = cellsToShift.length - 1; i >= 0; i--) {
        const toMove = cellsToShift[i];
        map[toMove.y + vector.y][toMove.x + vector.x] = map[toMove.y][toMove.x];
    }

    moveRobot(instr);
}

const createWideBox = (p) => {
    let p1 = { ...p, v: map[p.y][p.x] };
    let p2 = map[p.y][p.x] === "]" ? { x: p.x - 1, y: p.y, v: "[" } : { x: p.x + 1, y: p.y, v: "]" }
    return { p1, p2, y: p.y };
}

const findBoxes = (box, boxes, vecY) => {
    const nextBoxes = [];
    const test1 = { x: box.p1.x, y: box.y + vecY };

    if (isBoxAt(test1)) {
        nextBoxes.push(createWideBox(test1));
    }

    const test2 = { x: box.p2.x, y: box.y + vecY };
    if (isBoxAt(test2)) {
        nextBoxes.push(createWideBox(test2));
    }

    boxes.push(...nextBoxes);
    nextBoxes.forEach(b => {
        findBoxes(b, boxes, vecY);
    });
}

const findBoxesAux = (box, vecY) => {
    let allBoxes = [box];
    findBoxes(box, allBoxes, vecY);
    return allBoxes;
}

const handleVerticalMove = (instr) => {
    const vector = directionMap[instr];
    const allBoxes = findBoxesAux(createWideBox({ x: robotPos.x + vector.x, y: robotPos.y + vector.y }), vector.y);

    if (!allBoxes.every(b => !isWallAt({ x: b.p1.x, y: b.y + vector.y }) && !isWallAt({ x: b.p2.x, y: b.y + vector.y }))) {
        return;
    }

    allBoxes.sort((a, b) => vector.y === -1 ? a.y - b.y : b.y - a.y).forEach(b => {
        map[b.p1.y][b.p1.x] = "."
        map[b.p1.y + vector.y][b.p1.x] = b.p1.v;
        map[b.p2.y][b.p2.x] = "."
        map[b.p2.y + vector.y][b.p2.x] = b.p2.v;
    })

    moveRobot(instr);
}

const calculateGPSDistance = () => {
    let sum = 0;
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            if (map[y][x] === "[") {
                sum += (y * 100 + x);
            }
        }
    }
    return sum;
}

const speedCalc = (s) => {
    for (let i = 0; i < s; i++) {
        executeInstruction();
        if (instructionIndex >= instructions.length) {
            noLoop();
            console.log("GPS sum:", calculateGPSDistance())
            break;
        }
    }
}

function setup() {
    // Data setup
    map = createMap();
    instructions = createInstructions();
    size = { h: map.length, w: map[0].length }
    directionMap = createDirectionsMap();

    if (!render) {
        noLoop();
        speedCalc(instructions.length);
        createCanvas(5, 5);
    }
    else {
        createCanvas(2700, 1400);
        textAlign(CENTER, CENTER);
        textSize(cellSize * 0.6);
    }
}

const drawCell = (v, x, y) => {
    if (v === "#") {
        fill(20, 10, 20);
        rect(x, y, cellSize, cellSize);
    }
    else if (v === "@") {
        noStroke();
        fill(255, 255, 255, 100);
        rect(x, y, cellSize, cellSize);
    }
    else if (v === ".") {
        //fill(40, 70, 40);
        //rect(x, y, cellSize, cellSize);
    }
    else if (v === "[") {
        stroke(150, 106, 3, 50);
        strokeWeight(2);
        fill(173, 122, 3, 50);
        rect(x + 2, y + 2, (cellSize - 2) * 2, cellSize - 4);
        noStroke();
    }
}

const drawMap = () => {
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            drawCell(map[y][x], x * cellSize, y * cellSize)
        }
    }
}

function draw() {
    // background(20);
    speedCalc(speed);
    drawMap();
}