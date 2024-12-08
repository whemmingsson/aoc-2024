
let map = [];
const cellSize = 25;
const speed = 10;
const regex = /[a-z]|[A-Z]|\d/;
const antennas = {};
let antennaKeys;

const dist = (a, b) => {
    return { r: a.r - b.r, c: a.c - b.c }
}

const isValidAntinode = (pos) => map[pos.r] && map[pos.r][pos.c];;

const constructAntinodes = (a, b, part1) => {
    const d = dist(b, a);
    if (part1) {
        return [{ c: a.c - d.c, r: a.r - d.r }, { c: b.c + d.c, r: b.r + d.r }];
    }

    const antinodes = [];
    let c = a.c, r = a.r;
    while (c <= map.length && r <= map[0].length) {
        antinodes.push({ r, c });
        c += d.c;
        r += d.r;
    }

    c = a.c;
    r = a.r;
    while (c >= 0 && r >= 0) {
        antinodes.push({ r, c });
        c -= d.c;
        r -= d.r;
    }
    return antinodes;
}

function setup() {
    createCanvas(50 * cellSize, 50 * cellSize);
    smooth();
    textAlign(CENTER);
    textSize(cellSize / 2);
    ellipseMode(CORNER);

    map = [];
    const rows = data.split("\n");

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        map.push(row.split("").map(v => { return { name: v, isAntenna: regex.test(v), isAntiNode: false } }));
    }

    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            const v = map[r][c];
            if (!regex.test(v.name)) continue;
            if (!antennas[v.name]) {
                antennas[v.name] = [];
            }
            antennas[v.name].push({ r, c });
        }
    }

    console.log(map);
    console.log(antennas);

    antennaKeys = Object.keys(antennas);

    background(0);
    drawMap();
}

let antennaIdx = 0;
let i = 0;
let j = 1;
let totalAntiNodes = 0;
let nodes;
function draw() {
    const antennaKey = antennaKeys[antennaIdx];
    const positions = antennas[antennaKey];

    constructAntinodes(positions[i], positions[j], false)
        .filter(isValidAntinode)
        .forEach(antinode => {
            if (!map[antinode.r][antinode.c].isAntiNode) {
                map[antinode.r][antinode.c].isAntiNode = true;
                totalAntiNodes++;
            }
        });

    if (j === antennas[antennaKey].length - 1) {
        i++;
        j = i + 1;

        if (j === antennas[antennaKey].length) {
            // Overflow
            antennaIdx++;
            i = 0;
            j = 1;
        }
    }
    else {
        j++;
    }


    if (antennaIdx === antennaKeys.length) {
        noLoop();
        console.log("Antinodes:", totalAntiNodes);
    }

    drawMap();
}

function drawAntenna(p, strokeColor) {
    const cell = map[p.r][p.c];

    fill(255);
    ellipse(p.c * cellSize, p.r * cellSize, cellSize - 2, cellSize - 2);

    // Text
    noStroke();
    fill(0);
    text(cell.name, p.c * cellSize + cellSize / 2 - 1, p.r * cellSize + cellSize / 2 + 4 - 1)
}

function drawMap() {
    noStroke();
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            const cell = map[r][c];
            if (cell.isAntenna) {
                noStroke();
                drawAntenna({ c, r });
            }
            if (cell.isAntiNode) {
                stroke(75, 125, 255);

                noFill();

                ellipse(c * cellSize, r * cellSize, cellSize - 2, cellSize - 2);
            }
            // else {
            //     noStroke();
            //     fill(0);
            //     ellipse(c * cellSize, r * cellSize, cellSize - 2, cellSize - 2);
            // }
        }
    }
}
