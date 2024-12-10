
// Display variables
const cellSize = 30;
let charCounter = 0;

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1 }, { x: 0, y: +1 }, { x: 0 - 1, y: 0 }, { x: 0 + 1, y: 0 }];
const map = [];
const allPoints = [];
let trailHeads = [];
let pt1 = 0;
let pt2 = 0;

const calculateTrails = (p) => {
    pt1 += countTrailsPt1(p, [], p);
    pt2 += countTrailsPt2(p);
}

const inBounds = (x, y) => x >= 0 && x < map.length && y >= 0 && y < map[0].length;
const isValueAt = (v, x, y) => map[y][x].v === v;

const getReachable = (p) => {
    const locations = [];
    const { x, y, v } = p;

    cardinalVectors.forEach(cv => {
        if (inBounds(x + cv.x, y + cv.y) && isValueAt(v + 1, x + cv.x, y + cv.y)) {
            locations.push(map[y + cv.y][x + cv.x]);
        }
    })

    return locations;
};


const countTrailsPt2 = (p) => {
    if (p.v === 9) { return 1; }
    return getReachable(p).map((s) => countTrailsPt2(s)).reduce((a, c) => a + c, 0);
};

const countTrailsPt1 = (p, trailEnds, origin) => {
    if (p.v === 9 && !trailEnds.includes(p)) {
        trailEnds.push(p);
        // Render
        /* noFill();
         stroke(255, 0, 0);
         strokeWeight(5);
         rect(p.x * cellSize + cellSize / 4, p.y * cellSize + cellSize / 4, cellSize / 2, cellSize / 2); */
        // fill(0);
        // text(origin.displayValue.toLowerCase(), p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2 + 1);

        return 1;
    }

    return getReachable(p).map((s) => countTrailsPt1(s, trailEnds, origin)).reduce((a, c) => a + c, 0);
}

function setup() {
    // Render setup
    createCanvas(cellSize * 41, cellSize * 41);
    textAlign(CENTER, CENTER);
    textSize(cellSize * 0.7);

    // Data setup
    data.split("\n").forEach((r, y) => {
        map.push([
            ...r.split("").map((v, x) => {
                const intV = parseInt(v);
                const isHead = intV === 0;
                const p = {
                    v: intV,
                    x,
                    y,
                    isHead: isHead,
                    displayValue: isHead ? String.fromCharCode(65 + charCounter % 26) : ""
                };
                if (isHead) charCounter++;
                allPoints.push(p);
                return p;
            }),
        ]);
    });

    trailHeads = allPoints.filter((p) => p.isHead);

    console.log("Trailheads count", trailHeads.length);

    drapMap();

    trailHeads.forEach(calculateTrails);

    console.log("Part 1", pt1);
    console.log("Part 2", pt2);
}

const elevationColors = new Map([
    [0, "#004C91"], // Deep Ocean Blue
    [1, "#007F7F"], // Coastal Blue-Green
    [2, "#238B45"], // Emerald Green
    [3, "#2E8B57"], // Forest Green
    [4, "#6B8E23"], // Olive Green
    [5, "#C19A6B"], // Sandy Brown
    [6, "#8B7355"], // Rocky Gray-Brown
    [7, "#A9A9A9"], // Stone Gray
    [8, "#D3D3D3"], // Pale Gray
    [9, "#FFFFFF"], // Snowy White
]);

const drapMap = () => {
    allPoints.forEach((p) => {
        const { x, y, v, isHead } = p;

        const color = elevationColors.get(v);

        fill(color);
        rect(x * cellSize, y * cellSize, cellSize, cellSize);

        if (isHead) {
            fill(255);
            text(p.displayValue, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2 + 1);
        }
    });
}

function draw() {

}
