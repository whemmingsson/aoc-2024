
const Parser = require("../common/parser.js");

const cardinalVectors = [{ x: 0, y: -1, d: "^" }, { x: 0, y: 1, d: "v" }, { x: -1, y: 0, d: "<" }, { x: 1, y: 0, d: ">" }];
const cardinalVectorsMap = {
    "0_-1": "^",
    "0_1": "v",
    "-1_0": "<",
    "1_0": ">"
}

class Stack {
    constructor() {
        this.items = [];
    }

    push(number) {
        this.items.push(number);
    }

    pop() {
        if (this.items.length === 0)
            return "Oops, the stack is empty!";
        return this.items.pop();
    }

    peek() {
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    getItems() {
        return this.items;
    }
}

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    key() {
        return this.x + "_" + this.y;
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

let path = new Stack();
let paths = [];

const findAllPathsAux = (from, to) => {
    path = new Stack();
    paths = [];
    path.push(from);
    findAllPaths(from, to);
    return paths;
}

const findShortestPath = (from, to) => {
    const allPaths = findAllPathsAux(from, to);
    let shortest = null;
    let shortestLength = Infinity;
    allPaths.forEach(path => {
        if (path.getItems().length < shortestLength) {
            shortest = path;
            shortestLength = path.getItems().length;
        }
    });

    return { length: shortestLength - 1, path: shortest.getItems().map(n => n.id) };
}

const findShortestPaths = (from, to) => {
    const allPaths = findAllPathsAux(from, to);
    allPaths.sort((a, b) => a.getItems().length - b.getItems().length);
    let shortestPaths = [];
    let shortestLength = allPaths[0].getItems().length;
    for (let i = 0; i < allPaths.length; i++) {
        if (allPaths[i].getItems().length === shortestLength) {
            shortestPaths.push({ length: shortestLength, path: allPaths[i].getItems().map(n => n.id) })
        }
        else { break; }
    }

    return shortestPaths;
}

const findAllPaths = (from, to) => {
    for (let i = 0; i < from.adjacent.length; i++) {
        const next = from.adjacent[i];
        if (next.id === to.id) {
            const temp = new Stack();
            path.getItems().forEach(pn => { temp.push(pn); });
            temp.push(next);
            paths.push(temp);
        }
        else if (path.getItems().findIndex(p => p.id === next.id) === -1) {
            path.push(next);
            findAllPaths(next, to);
            path.pop();
        }
    }
}

const constructGraph = (m) => {
    let nodes = [];
    let nodeMap = {};
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

const getDistanceVec = (a, b) => {
    return new Vec(b.x - a.x, b.y - a.y);
}

class Keypad {
    constructor(type) {
        this.matrix = [];
        if (type === "NUMPAD") {
            this.matrix.push(['7', '8', '9']);
            this.matrix.push(['4', '5', '6']);
            this.matrix.push(['1', '2', '3']);
            this.matrix.push(['-', '0', 'A']);
        }
        else if (type === "CONTROL") {
            this.matrix.push(['-', '^', 'A']);
            this.matrix.push(['<', 'v', '>']);
        }

        const [nodes, graph] = constructGraph(this.matrix);

        // Nodes = raw list of nodes
        this.nodes = nodes;

        // A map of id -> node
        this.graph = graph;

        // Set the robot hand pointer to initial position, always A
        this.current = 'A';

        // Save the previously shortest path possible from N->U
        this.pathsCache = {};
    }

    reset() {
        this.current = "A";
    }

    push(button) {
        let targetButton = this.graph[button];
        let currentButton = this.graph[this.current];
        let shortestPaths = findShortestPaths(currentButton, targetButton);

        let directionsList = [];
        shortestPaths.forEach(path => {
            let prev = this.graph[path.path[0]];
            let directions = []
            for (let i = 1; i < path.path.length; i++) {
                let node = this.graph[path.path[i]];
                directions.push(cardinalVectorsMap[getDistanceVec(prev, node).key()]);
                prev = node;
            }
            directions.push("A");
            directionsList.push(directions);
        });

        this.current = button;

        const directionsStringList = [];
        directionsList.forEach(dl => {
            directionsStringList.push(dl.join(""));
        });
        return directionsStringList;
    }

    type(sequence) {
        let allSteps = [];
        allSteps[0] = "";
        sequence.split("").forEach(button => {
            const buttonSteps = this.push(button);
            let newAllSteps = [];
            for (let i = 0; i < buttonSteps.length; i++) {
                for (let j = 0; j < allSteps.length; j++) {
                    newAllSteps.push(allSteps[j] + buttonSteps[i]);
                }
            }
            allSteps = newAllSteps;
        });
        return allSteps;
    }
}

class Control {

}

module.exports = class Day {
    static run() {
        const keypad = new Keypad("NUMPAD");
        const control = new Keypad("CONTROL");

        //let res = keypad.type("029A");
        control.reset();
        //let res2 = control.type(res[2]);
        control.reset();
        let res3 = control.type("^v");
        console.log(res3.length);

        return;

    }
}