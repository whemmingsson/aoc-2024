const useExample = false;

// Display variables
const cellSize = 10;
const plantColors = {};

// Algoritm variables
const cardinalVectors = [{ x: 0, y: -1, d: "N" }, { x: 0, y: 1, d: "S" }, { x: -1, y: 0, d: "W" }, { x: 1, y: 0, d: "E" }];
const map = [];
const plotDict = {};
const quadrants = [0, 0, 0, 0]; // TL, TR, BL, BR

const robots = [];

class Robot {
    constructor(p, v, i) {
        this.p = p;
        this.v = v;
        this.color = { r: random(50, 100), g: random(85, 255), b: random(20, 100) };
        this.id = i;
        console.log(this.color);
    }

    move() {
        // Update position
        this.p.x += this.v.x;
        this.p.y += this.v.y;

        // "Wrap"
        if (this.p.x >= size.w) {
            this.p.x -= size.w;
        }
        else if (this.p.x < 0) {
            this.p.x += size.w;
        }

        if (this.p.y >= size.h) {
            this.p.y -= size.h;
        }
        else if (this.p.y < 0) {
            this.p.y += size.h;
        }
    }

    render() {
        noStroke();
        fill(this.color.r, this.color.g, this.color.b);
        rect(this.p.x * cellSize, this.p.y * cellSize, cellSize, cellSize);
        //fill(255, 100);
        //text(this.id, this.p.x * cellSize + cellSize / 2, this.p.y * cellSize + cellSize / 2)

    }
}

const size = useExample ? { w: 11, h: 7 } : { w: 101, h: 103 }

const inBounds = (x, y) => x >= 0 && x < map.length && y >= 0 && y < map[0].length;

const safePush = (d, k, v) => {
    if (!d[k]) {
        d[k] = [];
    }
    d[k].push(v);
}

function setup() {
    // Render setup
    createCanvas(1200, 1200);
    textAlign(CENTER, CENTER);
    textSize(cellSize * 0.6);
    // frameRate(10);

    // Data setup
    const regex = /-*\d+/g;
    (useExample ? data_example : data).split("\n").forEach((r, i) => {
        const values = r.match(regex);
        console.log(values);
        const p = { x: parseInt(values[0]), y: parseInt(values[1]) }
        const v = { x: parseInt(values[2]), y: parseInt(values[3]) }
        const robot = new Robot(p, v, i);
        robots.push(robot);
    });

    console.log(robots);

    drawGrid();
    drawRobots();

    //speedAhead(7800);
}

const countInQuadrants = () => {
    const mX = Math.floor(size.w / 2);
    const mY = Math.floor(size.h / 2);
    robots.filter((r) => r.p.x !== mX && r.p.y !== mY).forEach(r => {
        if (r.p.x < mX && r.p.y < mY) {
            quadrants[0]++;
        }
        else if (r.p.x > mX && r.p.y < mY) {
            quadrants[1]++;
        }
        else if (r.p.x < mX && r.p.y > mY) {
            quadrants[2]++;
        }

        else if (r.p.x > mX && r.p.y > mY) {
            quadrants[3]++;
        }
    });

    console.log(quadrants);
}

const calculateSafetyFactor = () => {
    countInQuadrants();
    return quadrants.reduce((a, c) => a * c, 1);
}

const drawGrid = () => {
    for (let y = 0; y < size.h; y++) {
        for (let x = 0; x < size.w; x++) {
            fill(0);
            stroke(50);
            rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

const drawRobots = () => {
    robots.forEach(r => r.render());
}

const moveRobots = () => {
    robots.forEach(r => r.move());
}

const moveAndDrawRobots = () => {
    robots.forEach(r => { r.move(); r.render() });
}

const speedAhead = (s) => {
    for (let i = 0; i < s; i++) {
        moveRobots();
        seconds++;
    }
    console.log(seconds);
}

let seconds = 0;

function mouseClicked() {
    background(0);
    //noLoop();
    moveAndDrawRobots();
    console.log(seconds++);
}

function draw() {

    for (let i = 0; i < 15; i++) {
        background(0);
        moveAndDrawRobots();
        seconds++;

        if (seconds === 7847) {
            noLoop();
            break;
        }
    }
}

// 4825 - current known lower bound
// upper bound: 7852