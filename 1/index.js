const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const left = [];
        const right = [];
        Parser.readRaw(__dirname, false).split("\n").forEach(line => {
            const r = line.match(/\d+/g);
            left.push(parseInt(r[0]));
            right.push(parseInt(r[1]));
        });

        // Part 1
        left.sort((a, b) => a - b);
        right.sort((a, b) => a - b);
        console.log("Part 1", left.reduce((s, l, i) => s + Math.abs(l - right[i]), 0));

        // Part 2
        console.log("Part 2", left.reduce((s, l) => s + (right.filter(r => r === l).length * l), 0));
    };
}