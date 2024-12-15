
const Parser = require("../common/parser.js");
const fs = require("fs");
module.exports = class Day {
    static run() {
        const offset = 10000000000000;
        const rows = Parser.readRaw(__dirname, false).split("\n").map(r => r.trim());
        const machines = [];

        const getVec = (row, reg, separator) => {
            let res = row.match(reg);
            let x = parseInt(res[0].split(separator)[1]);
            let y = parseInt(res[1].split(separator)[1]);
            return { x, y };
        }

        const getVector = (row) => {
            return getVec(row, /X\+\d+|Y\+\d+/g, "+");
        }

        const getPriceTarget = (row) => {
            let target = getVec(row, /X=\d+|Y=\d+/g, "=");
            // Part 2
            target.x = target.x + offset;
            target.y = target.y + offset;
            return target;
        }

        let current = { index: 0 };
        let index = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row === "") {
                index++;
                machines.push(current);
                current = { index };

            }
            else if (row.startsWith("Button A")) {
                current["A"] = getVector(row);
            }
            else if (row.startsWith("Button B")) {
                current["B"] = getVector(row);
            }
            else if (row.startsWith("Prize")) {
                current["prize"] = getPriceTarget(row);
            }
        }
        machines.push(current);

        console.log(machines);

        const solvesForX = (m, a, b) => {
            return (a * m.A.x + b * m.B.x) === m.prize.x;
        }

        const solvesForY = (m, a, b) => {
            return (a * m.A.y + b * m.B.y) === m.prize.y;
        }

        const solves = (m, a, b) => {
            return solvesForX(m, a, b) && solvesForY(m, a, b);
        }

        const cost = (a, b) => {
            return a * 3 + b;
        }

        const printMtx = (mtx, index) => {
            let str = "";
            mtx.forEach(r => {
                str += r.join("") + "\n";
            });

            fs.writeFileSync("files/" + index.toString(), str);
        }

        const bruteForceMinTokens = (m) => {
            let minA = 0, minB = 0, maxA = 100, maxB = 100;

            /*console.log("A range:", minA, maxA);
            console.log("B range:", minB, maxB); */

            for (let a = minA; a <= maxA; a++) {
                for (let b = minB; b <= maxB; b++) {
                    if (!solves(m, a, b)) continue;
                    return cost(a, b);
                }
            }

            return Infinity;
        }

        const isOne = (v) => {
            return v > 0.99999999;
        }

        const isZero = (v) => {
            return v < 0.00000001;
        }

        const normalize = (v) => {
            const decimalExpansion = v % 1;
            if (isZero(decimalExpansion)) {
                return Math.floor(v);
            }
            else if (isOne(decimalExpansion)) {
                return Math.ceil(v);
            }
            return -1;
        }

        const getMinTokensMath = (m) => {
            // a = n / d
            const n = m.B.x * m.prize.y - m.B.y * m.prize.x;
            const d = m.A.y * m.B.x - m.B.y * m.A.x;
            let a = n / d;

            // calculate b
            let b = (m.prize.x - m.A.x * a) / m.B.x;

            a = normalize(a);
            if (a === -1) {
                return Infinity;
            }

            b = normalize(b);
            if (b === -1) {
                return Infinity;
            }

            // calculate cost
            let c = a * 3 + b;

            if (c <= 0) {
                return Infinity;
            }

            if (Number.isInteger(c)) {
                return c;
            }

            return Infinity;
        }

        let total = 0;
        machines.forEach((m) => {
            //const numTokens = bruteForceMinTokens(m);
            const numTokensMath = getMinTokensMath(m);
            if (numTokensMath < Infinity) {
                console.log("Found solution");
                total += numTokensMath;
            }
            else {
                console.log("NO solution")
            }
        });

        console.log(total);
    }
}

// Too low: 56865584425514
// Too low: 70555290965673