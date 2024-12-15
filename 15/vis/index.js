const useExample = false;

// Display variables
const cellSize = 10;
const speed = 20;

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
    console.log("Executing instruction", instruction, "at index", instructionIndex);
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


let keyOf = (p) => {
    return p.x + "_" + p.y;
}

const constructFullBox = (p) => {
    // p is a position of a box
    let p1 = { ...p, v: map[p.y][p.x] };
    let p2 = map[p.y][p.x] === "]" ? { x: p.x - 1, y: p.y, v: "[" } : { x: p.x + 1, y: p.y, v: "]" }


    // y is the same, but x is not the same. Pick lowest x.
    const smallestX = Math.min(p1.x, p2.x);
    return { p1, p2, key: keyOf({ x: smallestX, y: p.y }), y: p.y, x: smallestX };
}

const findAllBoxesAbove = (box, boxes, found, vecY) => {
    console.log(box);
    // I there one or several boxes above?
    // Check part 1
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
    console.log("  Handle vertical move");
    const vector = directionMap[instr];
    const originalPos = { x: robotPos.x, y: robotPos.y };

    let boxPart1 = { x: originalPos.x + vector.x, y: originalPos.y + vector.y };
    let boxPart2 = map[boxPart1.y][boxPart1.x] === "]" ? { x: boxPart1.x - 1, y: boxPart1.y } : { x: boxPart1.x + 1, y: boxPart1.y }

    console.log(boxPart1);
    console.log(boxPart2);


    // Find all boxes that would be affected by move

    // Divide the problem - start with moving up
    let allBoxes = [];
    let box1 = constructFullBox(boxPart1)
    allBoxes = findAllBoxesAux(box1, vector.y);

    console.log("All boxes up for move!", allBoxes);

    // Can they be moved? Need to check if all above is free!
    const canMove = allBoxes.every(b => map[b.y + vector.y][b.p1.x] !== "#" && map[b.y + vector.y][b.p2.x] !== "#");



    if (!canMove) {
        return;
    }

    allBoxes.sort((a, b) => vector.y === -1 ? a.y - b.y : b.y - a.y);

    console.log("All boxes up for move (sorted)!", allBoxes);

    allBoxes.forEach(b => {
        console.log("Moving box", b);
        // Move p1
        const p1v = b.p1.v;
        map[b.p1.y][b.p1.x] = "."
        map[b.p1.y + vector.y][b.p1.x] = p1v;

        // Move p2
        const p2v = b.p2.v;
        map[b.p2.y][b.p2.x] = "."
        map[b.p2.y + vector.y][b.p2.x] = p2v;
    })

    // Update the robots position
    updateRobotPos(instr);

    map[originalPos.y + vector.y][originalPos.x + vector.x] = "@";
    map[originalPos.y][originalPos.x] = ".";

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

function mouseClicked() {
    executeInstruction();
    drawMap();
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

    drawMap();

    speedAhead();
}

const drawCell = (v, x, y) => {
    if (v === "#") {
        stroke(0);
        fill(0);
    }
    else if (v === "[") {
        stroke(230, 161, 0);
        fill(230, 161, 0);
    }
    else if (v === "]") {
        stroke(230, 161, 0);
        fill(230, 161, 0);
    }
    else if (v === "@") {
        noStroke();
        fill(200, 50, 50);
    }
    else {
        stroke(0);
        fill(255);
    }

    rect(x, y, cellSize, cellSize);

    if (v === "[") {
        fill(0);
        text("[", x + cellSize / 2, y + cellSize / 2);
    }

    if (v === "]") {
        fill(0);
        text("]", x + cellSize / 2, y + cellSize / 2);
    }
    if (v === "@" && instructionIndex < instructions.length - 1) {
        fill(0);
        text(instructions[instructionIndex], x + cellSize / 2, y + cellSize / 2);
    }
}

const drawMap = () => {
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            drawCell(map[y][x], x * cellSize, y * cellSize)
        }
    }

    // Display shade of where the bot should move next 
    if (instructionIndex < instructions.length - 1) {
        const vec = directionMap[instructions[instructionIndex]];
        const rX = robotPos.x + vec.x;
        const rY = robotPos.y + vec.y;
        fill(255, 20, 20, 100);
        rect(rX * cellSize, rY * cellSize, cellSize, cellSize);
    }
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

    speedCalc();
    drawMap();
}

// 4825 - current known lower bound
// upper bound: 7852