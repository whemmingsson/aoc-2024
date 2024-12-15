const useExample = false;

// Display variables
const cellSize = 20;
const speed = 20;

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1, d: "^" }, { x: 0, y: 1, d: "v" }, { x: -1, y: 0, d: "<" }, { x: 1, y: 0, d: ">" }];
let directionMap = {};
let map = [];
let instructions;
let robotPos;
let instructionIndex = 0;

let size = useExample ? { w: 10, h: 10 } : { w: 50, h: 50 }

const inBounds = (x, y) => x >= 0 && x < map.length && y >= 0 && y < map[0].length;

const safePush = (d, k, v) => {
    if (!d[k]) {
        d[k] = [];
    }
    d[k].push(v);
}

const createMap = () => {
    const m = [];
    (useExample ? data_map_example : data_map).split("\n").forEach((r, i) => {
        const rowSplit = r.trim().split("");
        m.push([...rowSplit]);
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
    console.log("Executing instruction", instruction, "at index", instructionIndex);

    const simpleMove = canMoveSimpleCase(instruction);
    if (simpleMove) {
        moveRobot(instruction);
    }
    else if (simpleMove !== undefined && !simpleMove) { }
    else {
        handleComplexMove(instruction);
    }

    instructionIndex++;
}

const handleComplexMove = (instr) => {
    const isBoxAt = (p) => {
        return map[p.y][p.x] === "O";
    }
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

    // Now, boxPos is either at an empty cell or at a wall. If at wall, we cannot move anything
    if (map[boxPos.y][boxPos.x] === "#") {
        return;
    }

    // Move everything from the end of the list:
    for (let i = cellsToShift.length - 1; i >= 0; i--) {
        const toMove = cellsToShift[i];
        map[toMove.y + vector.y][toMove.x + vector.x] = map[toMove.y][toMove.x];
    }

    // Update the robots position
    updateRobotPos(instr);

    // Clear the old robot pos
    map[originalPos.y][originalPos.x] = ".";
}

const calculateGPSDistance = () => {
    let sum = 0;
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            if (map[y][x] === "O") {
                sum += (y * 100 + x);
            }
        }
    }
    return sum;
}

function mouseClicked() {
    //executeInstruction();
    //drawMap();
}

function setup() {
    // Render setup
    createCanvas(1200, 1200);
    textAlign(CENTER, CENTER);
    textSize(cellSize * 0.6);

    // Data setup
    map = createMap();
    instructions = createInstructions();
    size = { h: map.length, w: map[0].length }
    robotPos = getStartPosition();
    directionMap = createDirectionsMap();

    console.log(map);
    console.log(instructions);
    console.log(robotPos);
    console.log(directionMap);
}

const drawCell = (v, x, y) => {
    if (v === "#") {
        fill(0);
    }
    else if (v === "O") {
        fill(230, 161, 0);
    }
    else if (v === "@") {
        fill(200, 50, 50);
    }
    else {
        fill(255);
    }

    rect(x, y, cellSize, cellSize);
}

const drawMap = () => {
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            drawCell(map[y][x], x * cellSize, y * cellSize)
        }
    }
}

function draw() {
    for (let i = 0; i < speed; i++) {
        executeInstruction();
        if (instructionIndex >= instructions.length) {
            noLoop();
            console.log("No more instructions");
            console.log("GPS sum:", calculateGPSDistance())
            break;
        }
    }

    drawMap();
}

// 4825 - current known lower bound
// upper bound: 7852