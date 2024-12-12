
const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        let d = {};

        Parser.readRaw(__dirname, false)
            .trim()
            .split(" ")
            .map((v) => d[v] = 1);

        const split = (s) => {
            return { a: s.slice(0, s.length / 2), b: s.slice(s.length / 2, s.length) };
        }

        const add = (d, k, v) => {
            if (!d[k]) {
                d[k] = 0;
            }
            d[k] += v;
        }

        const blinkPt2 = () => {
            const nd = {};
            Object.keys(d).forEach(stone => {
                if (stone == 0) {
                    add(nd, 1, d[stone]);
                }
                else if (stone.length % 2 === 0) {
                    const { a, b } = split(stone);
                    add(nd, parseInt(a), d[stone]);
                    add(nd, parseInt(b), d[stone]);
                }
                else {
                    add(nd, stone * 2024, d[stone]);
                }
            });

            d = nd;
        }

        for (let i = 0; i < 75; i++) {
            blinkPt2();
        }

        console.log(Object.keys(d).map(k => d[k]).reduce((a, c) => a + c, 0));
    }
}