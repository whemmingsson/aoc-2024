const useExample = false;

// Display variables
const cellSize = 10;
const plantColors = {};

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1, d: "N" }, { x: 0, y: +1, d: "S" }, { x: 0 - 1, y: 0, d: "W" }, { x: 0 + 1, y: 0, d: "E" }];
const map = [];
const allPlots = [];
const plantDict = {};
const plotDict = {};
const plantIdDict = {};

const inBounds = (x, y) => x >= 0 && x < map.length && y >= 0 && y < map[0].length;

const getPerimeter = (plots, plantId) => {
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

const getSides = (plots, plantId) => {
    const originalPlantId = plantId[0];
    const perimiter = [];
    let i = 0;
    plots.forEach(p => {
        cardinalVectors.forEach(vec => {
            if ((!inBounds(p.x + vec.x, p.y + vec.y) // Is the value not inside the map
                || map[p.y + vec.y][p.x + vec.x].v !== originalPlantId // Is the value different from the original plant id
            )) {
                perimiter.push({ x: p.x + vec.x, y: p.y + vec.y, visited: false, index: i++, direction: vec.d });
            }
        });
    });

    let totalSides = 0;

    // Construct
    ["N", "S", "E", "W"].forEach(direction => {
        const periemeterMap = {};
        perimiter.filter(p => p.direction === direction).forEach(p => {
            if (direction === "N" || direction === "S") {
                if (!periemeterMap[p.y]) {
                    periemeterMap[p.y] = [];
                }

                periemeterMap[p.y].push(p.x);
            }
            else {
                if (!periemeterMap[p.x]) {
                    periemeterMap[p.x] = [];
                }

                periemeterMap[p.x].push(p.y);
            }
        });

        // Sort
        Object.keys(periemeterMap).forEach(k => periemeterMap[k].sort((a, b) => a - b));

        // Count
        Object.keys(periemeterMap).forEach(k => {
            let i = 0;
            let c = periemeterMap[k][i];
            let sides = 1;
            while (i < periemeterMap[k].length - 1) {
                let n = periemeterMap[k][i + 1];
                if (n !== c + 1) {
                    sides++;
                }

                c = n;
                i++;
            }
            totalSides += sides;
        });
    })

    return totalSides;
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
            let plotPlants = findConnectedPlants(map[y][x]);
            if (plotPlants.length > 0) {
                plotDict[map[y][x].v + "_" + x + "_" + y] = plotPlants;
            }
        }
    }

    // Setup colormap
    Object.keys(plotDict).forEach(plantId => {
        const originalId = plantId[0];
        plantColors[originalId] = { r: random(20, 200), g: random(100, 200), b: random(20, 100) }
    })

    drapMap();

    let total = 0;
    Object.keys(plotDict).forEach(plantId => {
        const plots = plotDict[plantId];
        const area = plots.length;
        const perimeter = getPerimeter(plots, plantId);
        const sides = getSides(plots, plantId);

        console.log("Plot ", plantId, "Area:", area, "Perimeter:", perimeter, "Sides:", sides);

        total += (area * sides);
    });

    console.log("Part 2:", total);
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

const drawPerimeter = (perimiter) => {
    perimiter.forEach(p => {
        stroke(255, 50, 50);
        strokeWeight(5);
        fill(255, 255, 255, 100);
        rect(p.x * cellSize + cellSize, p.y * cellSize + cellSize, cellSize, cellSize);

        stroke(0, 0, 255);
        switch (p.direction) {
            case "N": line(p.x * cellSize + cellSize, p.y * cellSize + cellSize + cellSize, p.x * cellSize + cellSize * 2, p.y * cellSize + cellSize + cellSize); break;
        }

        noStroke();
        fill(255);
        text(p.index, p.x * cellSize + cellSize / 2 + cellSize, p.y * cellSize + cellSize / 2 + cellSize);
    })
}

function draw() {

}
