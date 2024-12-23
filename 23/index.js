
const Parser = require("../common/parser.js");

class Computer {
    constructor(id) {
        this.id = id;
        this.adjacent = [];
    }
}

const USE_EXAMPLE = false;

module.exports = class Day {
    static run() {
        let computers = [];
        let computersMap = {};
        Parser.readRaw(__dirname, USE_EXAMPLE)
            .split("\n")
            .map(v => v.trim())
            .forEach((v) => {
                let vSplit = v.split("-");
                let left = vSplit[0];
                let right = vSplit[1];

                let c1, c2;
                if (!computersMap[left]) {
                    c1 = new Computer(left);
                    computersMap[left] = c1;
                    computers.push(c1);
                }
                if (!computersMap[right]) {
                    c2 = new Computer(right);
                    computersMap[right] = c2;
                    computers.push(c2);
                }
            });

        Parser.readRaw(__dirname, USE_EXAMPLE)
            .split("\n")
            .map(v => v.trim())
            .forEach((v) => {
                let vSplit = v.split("-");
                let left = vSplit[0];
                let right = vSplit[1];

                let c1 = computersMap[left];
                let c2 = computersMap[right];
                if (c1 && c2) {
                    c1.adjacent.push(c2);
                    c2.adjacent.push(c1);
                }
            });

        let networks = new Set();
        let networksMap = {};
        computers.forEach(computer => {
            let s = new Set();
            let connected = computer.adjacent;
            connected.forEach(other => {
                s.add(other.id);
            });

            connected.forEach(other => {
                for (let i = 0; i < other.adjacent.length; i++) {
                    let otherOther = other.adjacent[i];
                    if (s.has(otherOther.id) && otherOther.id !== computer.id) {
                        let ids = [computer.id, other.id, otherOther.id];
                        ids.sort();
                        let k = ids.join("_");
                        if (!networksMap[k] && ids.some(id => id[0] === 't')) {
                            networks.add(ids);
                            networksMap[k] = true;
                        }
                    }
                }
            });
        });

        let part1 = networks.size;
        console.log(part1);
    }
}