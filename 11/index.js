
const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        let d = {};

        Parser.readRaw(__dirname, false)
            .trim()
            .split(" ")
            .map((v) => d[v] = 1);



        const blinkPt2 = () => {
            const add = (d, k, v) => {
                if (!d[k]) {
                    d[k] = 0;
                }
                d[k] += v;
            }

            const n = {};
            Object.keys(d).forEach(s => {
                if (s == 0) {
                    add(n, 1, d[s]);
                }
                else if (s.length % 2 === 0) {
                    add(n, parseInt(s.slice(0, s.length / 2)), d[s]);
                    add(n, parseInt(s.slice(s.length / 2, s.length)), d[s]);
                }
                else {
                    add(n, s * 2024, d[s]);
                }
            });

            d = n;
        }

        for (let i = 0; i < 120; i++) {
            blinkPt2();
        }

        console.log(Object.keys(d).map(k => d[k]).reduce((a, c) => a + c, 0));
    }
}