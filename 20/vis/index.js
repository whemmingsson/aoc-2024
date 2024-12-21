const useExample = false; // Use simpler data
const render = true; // If false, the algoritm runs until completion without rendering

// Display variables
let cellSize = 15;
let speed = 20;

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1, d: "^" }, { x: 0, y: 1, d: "v" }, { x: -1, y: 0, d: "<" }, { x: 1, y: 0, d: ">" }];
let map = [];
let start, end;
let nodes = [];
let path = {};
let pathMap = {};
let walls = [];
let wallsToRemove = [];
let santa;
let size;
let pathContructed = false;
// Algorithm land!
let currentWallToRemoveIndex = 0;

class GNode {
    constructor(x, y, id, v) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.v = v;
        this.adjacent = [];
        this.isWall = v === "#";
        this.canBeCheated = false;
        this.nextNode = null;
    }

    next() {
        // Filter out all nodes already visited in the path generation
        let adj = this.adjacent.filter(a => !a.isWall && !path[a.id]);

        if (adj.length > 1) throw new Error(`More than 1 possible path for node=${this.id}`);
        if (adj.length === 0) throw new Error(`No adjacent nodes node=${this.id}`);

        // Set the next node in the [initial] path
        this.nextNode = adj[0];

        return adj[0];
    }
}

const createMap = () => {
    const m = [];
    let i = 0;
    (useExample ? data_map_example : data_map).split("\n").forEach((r, y) => {
        const row = [];
        const rowSplit = r.trim().split("");
        rowSplit.forEach((c, x) => {
            let node = new GNode(x, y, i, c);
            row.push(node);
            nodes.push(node);
            i++;

            if (c === "#") {
                walls.push(node);
            }
            if (c === "S") {
                start = node;
            }
            if (c === "E") {
                end = node;
            }
        })

        m.push(row);
    });

    size = { h: m.length, w: m[0].length };
    santa = { ...start };

    return m;
}

const isWallAt = (p) => {
    return map[p.y][p.x] === "#";
}

let keyOf = (p) => {
    return p.x + "_" + p.y;
}

const speedCalc = (s) => {
    for (let i = 0; i < s; i++) {

    }
}

const inBounds = (x, y) => x >= 0 && x < size.w && y >= 0 && y < size.h;

const getAllNeighbors = (n) => {
    let nbs = [];
    cardinalVectors.forEach(cv => {
        let x = n.x + cv.x;
        let y = n.y + cv.y;
        if (!inBounds(x, y)) return;
        nbs.push(map[y][x]);
    });
    return nbs;
}

const getOpenNeighbors = (n) => {
    return getAllNeighbors(n).filter(n => !n.isWall);
}

const countOpenNeighbors = (n) => {
    return getOpenNeighbors(n).length;
}

const canBeCheated = (n) => {
    return countOpenNeighbors(n) > 1;
}

const setCanBeCheated = () => {
    walls.forEach(wall => {
        wall.canBeCheated = canBeCheated(wall);
        if (wall.canBeCheated) {
            wallsToRemove.push(wall);
        }
    });
}

const setupAdjacent = () => {
    nodes.forEach(n => {
        n.adjacent = getOpenNeighbors(n);
    })
}

const constructPath = () => {
    try {
        while (moveSanta()) { };
    }
    catch (e) {
        console.log("End");
    }
    pathContructed = true;
    pathMap[start.id] = -1;
}

function setup() {
    const WIDTH = 1000;
    const HEIGHT = 1000;

    map = createMap();
    setCanBeCheated();
    setupAdjacent();

    path[start.id] = true;

    constructPath();

    runPart1();

    if (!render) {
        noLoop();
    }
    else {
        createCanvas(WIDTH, HEIGHT);
        textAlign(CENTER, CENTER);
        textSize(cellSize * 0.6);
        //frameRate(10);
    }

    cellSize = 1000 / size.w;

    drawMap();
    drawSanta();
}

const drawCell = (n, x, y) => {
    if (n.isWall) {
        if (n.canBeCheated)
            fill(50);
        else
            fill(0);
    }
    else {
        fill(40, 150, 250);
    }

    if (n.isBeingTested) {
        fill(220, 220, 0);
    }

    rect(x, y, cellSize, cellSize);

    fill(255);
    text(n.id, x + cellSize / 2, y + cellSize / 2);
}

const drawMap = () => {
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            drawCell(map[y][x], x * cellSize, y * cellSize)
        }
    }

    // Draw start
    fill(200, 50, 50);
    rect(start.x * cellSize, start.y * cellSize, cellSize, cellSize);

    // Draw end
    fill(50, 200, 50);
    rect(end.x * cellSize, end.y * cellSize, cellSize, cellSize);
}

const drawSanta = () => {
    let santaWidth = cellSize * 0.7;
    fill(220);
    ellipse(santa.x * cellSize + cellSize / 2, santa.y * cellSize + cellSize / 2, santaWidth, santaWidth);
}

let pathLength = 0;
const moveSanta = () => {
    let current = map[santa.y][santa.x];
    let { x, y, id } = current.next();
    path[id] = true;
    pathMap[id] = Object.keys(pathMap).length;
    santa.x = x;
    santa.y = y;

    if (santa.x === end.x && santa.y === end.y) {
        pathLength = Object.keys(path).length - 1;
        console.log("Santa reached end! (in", pathLength, "steps)");
        return false;
    }
    return true;
}

function draw() {
    if (pathContructed) {
        return;
    }

    if (!useExample) {
        // "Speedcalc"
        for (let i = 0; i < speed; i++) {
            if (!moveSanta()) {
                noLoop();
                break;
            }
        }
        drawSanta();
    }
    else {
        if (!moveSanta()) {
            noLoop();
        }
        drawSanta();
    }

}

function mouseClicked() {
    const mX = Math.floor(mouseX / cellSize);
    const mY = Math.floor(mouseY / cellSize);

    const nodeAtMouse = map[mY][mX];

    if (nodeAtMouse.isWall) {
        removeWall(nodeAtMouse);
    }
}

const runPart1 = () => {
    let cheatScores = {};
    wallsToRemove.forEach(w => {
        let savings = removeWall(w);
        if (!cheatScores[savings]) {
            cheatScores[savings] = 0;
        }

        cheatScores[savings]++;
    });

    console.log(cheatScores);

    let countCheats = 0;
    Object.keys(cheatScores).forEach(saving => {
        if (saving >= 100) {
            countCheats += cheatScores[saving];
        }
    });

    console.log("Number of cheats that would save at least 100:", countCheats);
}


const removeWall = (wall) => {
    let nodesInPath = wall.adjacent;

    if (nodesInPath.length === 2) {
        // Simple case
        let aIndex = pathMap[nodesInPath[0].id];
        let bIndex = pathMap[nodesInPath[1].id];
        let diff = Math.abs(aIndex - bIndex);
        return diff - 2;
    }
    else if (nodesInPath.length === 3) {
        let aIndex = pathMap[nodesInPath[0].id];
        let bIndex = pathMap[nodesInPath[1].id];
        let cIndex = pathMap[nodesInPath[2].id];
        let inidices = [aIndex, bIndex, cIndex].sort((a, b) => a - b);
        let diff = Math.abs(inidices[2] - inidices[0]);
        return diff - 2;
    }

    return -1000;
}


/* Santa reached end! (in 9380 steps) */