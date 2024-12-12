const useExample = false;

// Display variables
const cellSize = 10;
const plantColors = {};

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1, d: "N" }, { x: 0, y: 1, d: "S" }, { x: -1, y: 0, d: "W" }, { x: 1, y: 0, d: "E" }];
const map = [];
const plotDict = {};

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

const safePush = (d, k, v) => {
    if (!d[k]) {
        d[k] = [];
    }
    d[k].push(v);
}

const getSides = (plots, plantId) => {
    const directionMaps = {};
    plots.forEach(p => {
        cardinalVectors.forEach(vec => {
            if ((!inBounds(p.x + vec.x, p.y + vec.y)
                || map[p.y + vec.y][p.x + vec.x].v !== plantId[0]
            )) {
                if (!directionMaps[vec.d]) {
                    directionMaps[vec.d] = {};
                }
                const vert = vec.d === "N" || vec.d === "S";
                const x = p.x + vec.x;
                const y = p.y + vec.y;
                safePush(directionMaps[vec.d], vert ? y : x, vert ? x : y)
            }
        });
    });

    let totalSides = 0;

    Object.keys(directionMaps).forEach(dk => {
        Object.keys(directionMaps[dk]).forEach(k => {
            directionMaps[dk][k].sort((a, b) => a - b);
            let i = 0;
            let c = directionMaps[dk][k][i];
            let sides = 1;
            while (i < directionMaps[dk][k].length - 1) {
                if (directionMaps[dk][k][i + 1] !== c + 1) {
                    sides++;
                }

                c = directionMaps[dk][k][i++ + 1]; // Wow!
            }
            totalSides += sides;
        });
    })

    return totalSides;
}

const findNeighborsNotVisited = (plot, plantList) => {
    const { v, x, y } = plot;
    cardinalVectors.forEach(vec => {
        if (inBounds(x + vec.x, y + vec.y) && map[y + vec.y][x + vec.x].v === v && !map[y + vec.y][x + vec.x].visited) {
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
                return {
                    x, y, v
                };
            }),
        ]);
    });

    // Setup a plot-dictionary
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x].visited) { continue; }
            let plotPlants = findConnectedPlants(map[y][x]);
            const key = map[y][x].v + "_" + x + "_" + y;
            if (plotPlants.length > 0) {
                plotDict[key] = plotPlants;
            }
            plotPlants.forEach(p => p.key = key);
        }
    }

    // Setup colormap
    Object.keys(plotDict).forEach(plantId => {
        plantColors[plantId] = { r: random(20, 220), g: random(100, 240), b: random(20, 120) }
    })

    drapMap();

    let totalPt1 = 0;
    let totalPt2 = 0;
    Object.keys(plotDict).forEach(plantId => {
        const plots = plotDict[plantId];
        totalPt1 += (plots.length * getPerimeter(plots, plantId));
        totalPt2 += (plots.length * getSides(plots, plantId))
    });

    console.log("Part 1:", totalPt1);
    console.log("Part 2:", totalPt2);
}

const drapMap = () => {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const c = plantColors[map[y][x].key];
            fill(c.r, c.g, c.b);
            stroke(c.r - 20, c.g - 20, c.b - 20);
            rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function draw() { }