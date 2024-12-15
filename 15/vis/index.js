const useExample = false;

// Display variables
const cellSize = 25;
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

const getStartPosition = () => {
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            if (map[y][x] === "@") return { x, y };
        }
    }
}

const createDirectionsMap = () => {
    let m = {};
    cardinalVectors.forEach(v => {
        m[v.d] = v;
    });
    return m;
}

const getTargetCell = (instr) => {
    const vector = directionMap[instr];
    return map[robotPos.y + vector.y][robotPos.x + vector.x];
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

const updateRobotPos = (instr) => {
    const vector = directionMap[instr];
    const newPos = { x: robotPos.x += vector.x, y: robotPos.y += vector.y };
    robotPos.x = newPos.x;
    robotPos.y = newPos.y;
}

const moveRobot = (instr) => {
    const vector = directionMap[instr];
    const originalPos = { x: robotPos.x, y: robotPos.y };
    const newPos = { x: robotPos.x += vector.x, y: robotPos.y += vector.y };
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
        handleComplexMove(instruction);
    }

    instructionIndex++;
}

const isBoxAt = (p) => {
    return map[p.y][p.x] === "[" || map[p.y][p.x] === "]";
}

const handleHorizontalMove = (instr) => {
    const vector = directionMap[instr];
    const originalPos = { x: robotPos.x, y: robotPos.y };
    let boxPos = { x: originalPos.x + vector.x, y: originalPos.y + vector.y }

    let cellsToShift = [];
    cellsToShift.push({ ...robotPos });
    while (isBoxAt(boxPos)) {
        cellsToShift.push({ ...boxPos });
        boxPos.x += vector.x;
        boxPos.y += vector.y;
    };

    if (map[boxPos.y][boxPos.x] === "#") {
        return;
    }

    for (let i = cellsToShift.length - 1; i >= 0; i--) {
        const toMove = cellsToShift[i];
        map[toMove.y + vector.y][toMove.x + vector.x] = map[toMove.y][toMove.x];
    }

    moveRobot(instr);
}

const constructFullBox = (p) => {
    let keyOf = (p) => {
        return p.x + "_" + p.y;
    }

    let p1 = { ...p, v: map[p.y][p.x] };
    let p2 = map[p.y][p.x] === "]" ? { x: p.x - 1, y: p.y, v: "[" } : { x: p.x + 1, y: p.y, v: "]" }
    const smallestX = Math.min(p1.x, p2.x);
    return { p1, p2, key: keyOf({ x: smallestX, y: p.y }), y: p.y, x: smallestX };
}

const findAllBoxesAbove = (box, boxes, found, vecY) => {
    const test1 = { x: box.p1.x, y: box.y + vecY };
    const nextBoxes = [];
    if (isBoxAt(test1)) {
        let foundBox = constructFullBox(test1);
        let k = foundBox.key;
        if (!found[k]) {
            found[k] = foundBox;
            nextBoxes.push(foundBox);
        }
    }

    const test2 = { x: box.p2.x, y: box.y + vecY };
    if (isBoxAt(test2)) {
        let foundBox = constructFullBox(test2);
        let k = foundBox.key;
        if (!found[k]) {
            found[k] = foundBox;
            nextBoxes.push(foundBox);
        }
    }

    if (nextBoxes.length > 0) {
        boxes.push(...nextBoxes);

        nextBoxes.forEach(b => {
            findAllBoxesAbove(b, boxes, found, vecY);
        })
    }
}

const findAllBoxesAux = (box, vecY) => {
    let found = {};
    let allBoxes = [];
    found[box.key] = box;
    allBoxes.push(box);
    findAllBoxesAbove(box, allBoxes, found, vecY);
    return allBoxes;
}

const handleVerticalMove = (instr) => {
    const vector = directionMap[instr];
    const originalPos = { x: robotPos.x, y: robotPos.y };

    let allBoxes = [];
    let box1 = constructFullBox({ x: originalPos.x + vector.x, y: originalPos.y + vector.y })
    allBoxes = findAllBoxesAux(box1, vector.y);

    const canMove = allBoxes.every(b => map[b.y + vector.y][b.p1.x] !== "#" && map[b.y + vector.y][b.p2.x] !== "#");

    if (!canMove) {
        return;
    }

    allBoxes.sort((a, b) => vector.y === -1 ? a.y - b.y : b.y - a.y);

    allBoxes.forEach(b => {
        map[b.p1.y][b.p1.x] = "."
        map[b.p1.y + vector.y][b.p1.x] = b.p1.v;
        map[b.p2.y][b.p2.x] = "."
        map[b.p2.y + vector.y][b.p2.x] = b.p2.v;
    })

    moveRobot(instr);
}

const handleComplexMove = (instr) => {
    if (instr === ">" || instr === "<") {
        handleHorizontalMove(instr);
    }
    else {
        // Vertical move. A bit more tricky. 
        handleVerticalMove(instr);
    }
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

function setup() {
    // Render setup
    createCanvas(2700, 1400);
    textAlign(CENTER, CENTER);
    textSize(cellSize * 0.6);

    // Data setup
    map = createMap();
    instructions = createInstructions();
    size = { h: map.length, w: map[0].length }
    robotPos = getStartPosition();
    directionMap = createDirectionsMap();
}

const drawCell = (v, x, y) => {
    if (v === "#") {
        fill(150, 50, 50);
        rect(x, y, cellSize, cellSize);
    }
    else if (v === "@") {
        noStroke();
        fill(0, 100, 250);
        rect(x, y, cellSize, cellSize);
    }
    else if (v === ".") {
        //stroke(0);
        fill(20);
        rect(x, y, cellSize, cellSize);
    }
    else if (v === "[") {
        stroke(150, 106, 3);
        strokeWeight(2);
        fill(173, 122, 3);
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

    /*// Display shade of where the bot should move next 
    if (instructionIndex < instructions.length - 1) {
        const vec = directionMap[instructions[instructionIndex]];
        const rX = robotPos.x + vec.x;
        const rY = robotPos.y + vec.y;
        fill(255, 20, 20, 100);
        rect(rX * cellSize, rY * cellSize, cellSize, cellSize);
    } */
}

const speedCalc = () => {
    for (let i = 0; i < speed; i++) {
        executeInstruction();
        if (instructionIndex >= instructions.length) {
            noLoop();
            console.log("No more instructions");
            console.log("GPS sum:", calculateGPSDistance())
            break;
        }
    }
}

const speedAhead = () => {
    for (let i = 0; i < 188; i++) {
        executeInstruction();
    }
    drawMap();
}

function draw() {
    background(20);
    speedCalc();
    drawMap();
}

// 4825 - current known lower bound
// upper bound: 7852