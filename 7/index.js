const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const expressions = [];
        Parser.readRaw(__dirname, false).split("\n").forEach(r => {
            const p = r.split(":");
            expressions.push({ total: parseInt(p[0]), operands: p[1].trim().split(" ").map(o => parseInt(o)) });
        })


        const testAux = (e) => {
            const test = (a, b, i) => {
                if (i > e.operands.length || !a || !b) {
                    return false;
                }

                const s = a + b;
                const m = a * b;

                if ((m === e.total || s === e.total) && i === e.operands.length) {
                    return true;
                }

                return test(s, e.operands[i], i + 1) || test(m, e.operands[i], i + 1)
            }

            return test(e.operands[0], e.operands[1], 2)
        }

        const sum = expressions.filter(e => testAux(e)).map(e => e.total).reduce((a, c) => a + c, 0);
        console.log("Part 1", sum);
    }
}