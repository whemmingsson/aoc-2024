const useExample = true;

// Display variables
const cellSize = 50;
const plantColors = {};

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1, d: "N" }, { x: 0, y: +1, d: "S" }, { x: 0 - 1, y: 0, d: "W" }, { x: 0 + 1, y: 0, d: "E" }];
const diagonalVectors = [{ x: -1, y: -1, d: "NW" }, { x: 1, y: 1, d: "SE" }, { x: 1, y: -1, d: "NE" }, { x: -1, y: 1, d: "SW" }];
const neighborVectors = [...cardinalVectors, ...diagonalVectors];
console.log(neighborVectors);
const map = [];
const allPlots = [];
const plantDict = {};
const plotDict = {};
const plantIdDict = {};

const inBounds = (x, y) => x >= 0 && x < map.length && y >= 0 && y < map[0].length;

const getPerimiter = (plots, plantId) => {
    const originalPlantId = plantId[0];
    let perimTotal = 0;
    plots.forEach(p => {
        cardinalVectors.forEach(vec => {
            if (!inBounds(p.x + vec.x, p.y + vec.y) || map[p.y + vec.y][p.x + vec.x].v !== originalPlantId) {
                perimTotal++;
            }
        });
    });

    return perimTotal;
}

const getNeighbors = (list) => {
    plots.forEach(p => {
        cardinalVectors.forEach(vec => {
            if (!inBounds(p.x + vec.x, p.y + vec.y) || map[p.y + vec.y][p.x + vec.x].v !== originalPlantId) {
                perimTotal++;
            }
        });
    });
}

const getSides = (plots, plantId) => {
    const originalPlantId = plantId[0];
    const k = (a, b) => {
        return a + "_" + b;
    }
    const perimiter = [];
    const foundIndecies = {};
    let i = 0;
    plots.forEach(p => {
        cardinalVectors.forEach(vec => {
            if (!inBounds(p.x + vec.x, p.y + vec.y) || map[p.y + vec.y][p.x + vec.x].v !== originalPlantId && !foundIndecies[k(p.x + vec.x, p.y + vec.y)]) {
                perimiter.push({ x: p.x + vec.x, y: p.y + vec.y, visited: false, index: i });
                foundIndecies[k(p.x + vec.x, p.y + vec.y)] = true;
                i++;
            }
        });
    });
    console.log(perimiter);
    drawPerimiter(perimiter);

    perimiter.sort((a, b) => a.x - b.x);
    console.log(perimiter.map(p => p.index));

    let current = perimiter[0];
    for (let i = 1; i < perimiter.length; i++) {
        // Find all neighbors of current
        const p = perimiter[i];
        // Find all neighbors
    }



    return perimiter.length;
}

const findNeighborsNotVisited = (plot, plantList) => {
    const { v, x, y } = plot;
    cardinalVectors.forEach(vec => {
        if (inBounds(x + vec.x, y + vec.y)
            && map[y + vec.y][x + vec.x].v === v
            && !map[y + vec.y][x + vec.x].visited) {
            map[y + vec.y][x + vec.x].visited = true;
            plantList.push(map[y + vec.y][x + vec.x]);
            findNeighborsNotVisited(map[y + vec.y][x + vec.x], plantList);
        }
    });
}

const findConnectedPlants = (v) => {
    const neighbors = [v];
    v.visited = true;
    findNeighborsNotVisited(v, neighbors);
    return neighbors;
}

function setup() {
    // Render setup
    createCanvas(1200, 1200);
    textAlign(CENTER, CENTER);
    textSize(cellSize * 0.7);

    // Data setup
    (useExample ? data_example : data).split("\n").forEach((r, y) => {
        map.push([
            ...r.split("").map((v, x) => {
                const plot = {
                    x, y, v
                };
                if (!plantDict[v]) {
                    plantDict[v] = [];
                }
                plantDict[v].push(plot);
                return plot;
            }),
        ]);
    });

    // Setup a plot-dictionary
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x].visited) { continue; }
            const plantId = map[y][x].v;
            let plotPlants = findConnectedPlants(map[y][x]);
            if (plotPlants.length > 0) {
                plotDict[plantId + "_" + x + "_" + y] = plotPlants;
            }
        }
    }

    // Setup colormap
    Object.keys(plotDict).forEach(plantId => {
        const originalId = plantId[0];
        plantColors[originalId] = { r: random(20, 200), g: random(100, 200), b: random(20, 100) }
    })

    drapMap();

    // Part 1
    let total = 0;
    Object.keys(plotDict).filter(p => p === "R_0_0").forEach(plantId => {
        const plots = plotDict[plantId];
        const area = plots.length;
        const perimiter = getPerimiter(plots, plantId);
        const sides = getSides(plots, plantId);
        console.log("Plot ", plantId, "Area:", area, "Perimiter:", perimiter, "Sides:", sides);
        total += (area * perimiter);
    });

    console.log("Part 1:", total);
}

const drapMap = () => {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const plot = map[y][x];
            const c = plantColors[plot.v];
            fill(c.r, c.g, c.b);
            stroke(c.r - 20, c.g - 20, c.b - 20);
            rect(x * cellSize + cellSize, y * cellSize + cellSize, cellSize, cellSize);
            fill(0);
            noStroke();
            text(plot.v, x * cellSize + cellSize / 2 + cellSize, y * cellSize + cellSize / 2 + cellSize);
        }
    }
}

const drawPerimiter = (perimiter) => {
    perimiter.forEach(p => {
        stroke(255, 50, 50);
        strokeWeight(5);
        fill(255, 255, 255, 100);
        rect(p.x * cellSize + cellSize, p.y * cellSize + cellSize, cellSize, cellSize);
        noStroke();
        fill(255);
        text(p.index, p.x * cellSize + cellSize / 2 + cellSize, p.y * cellSize + cellSize / 2 + cellSize);
    })
}

function draw() {

}
