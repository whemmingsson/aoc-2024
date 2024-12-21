
const Parser = require("../common/parser.js");

const cardinalVectors = [{ x: 0, y: -1, d: "^" }, { x: 0, y: 1, d: "v" }, { x: -1, y: 0, d: "<" }, { x: 1, y: 0, d: ">" }];

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class GNode {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.adjacent = [];
    }

    addAdj(adj) {
        if (this.adjacent.findIndex(a => a.id === adj.id) === -1) {
            this.adjacent.push(adj);
        }
    }

    addAdjs(adjs) {
        adjs.forEach(a => this.addAdj(a));
    }
}

const inBounds = (x, y, w, h) => x >= 0 && x < w && y >= 0 && y < h;

const findAdjacent = (map, mtx, node) => {
    let w = mtx[0].length;
    let h = mtx.length;
    let adjs = [];
    cardinalVectors.forEach(cv => {
        let x = node.x + cv.x;
        let y = node.y + cv.y;
        if (inBounds(x, y, w, h)) {
            let adj = map[mtx[y][x]];
            if (adj.id === "-") return;
            adjs.push(adj);
        }
    });
    return adjs;
}

const constructGraph = (m) => {
    let nodes = [];
    let nodeMap = {};
    // Setup
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            let n = new GNode(x, y, m[y][x]);
            nodeMap[m[y][x]] = n;
            nodes.push(n);
        }
    }

    nodes.forEach(n => {
        let adjs = findAdjacent(nodeMap, m, n);
        n.addAdjs(adjs);
    });

    return [nodes, nodeMap];
}

class Keypad {

    /* +---+---+---+
| 7 | 8 | 9 |
+---+---+---+
| 4 | 5 | 6 |
+---+---+---+
| 1 | 2 | 3 |
+---+---+---+
    | 0 | A |
    +---+---+ */

    constructor() {
        this.matrix = [];
        this.matrix.push(['7', '8', '9']);
        this.matrix.push(['4', '5', '6']);
        this.matrix.push(['1', '2', '3']);
        this.matrix.push(['-', '0', 'A']);

        const [nodes, graph] = constructGraph(this.matrix);

        // Nodes = raw list of nodes
        this.nodes = nodes;

        // A map of id -> node
        this.graph = graph;

        // Set the robot hand pointer to initial position
        this.pointer = new Vec(2, 3);
    }

    push(button) {
        // Return all possible way to reach and push this button from the current position (pointer)
    }
}

class Control {

}

module.exports = class Day {
    static run() {
        let keypad = new Keypad();
        console.log(keypad.matrix);
    }
}