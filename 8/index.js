const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const map = [];
        const a = {};
        const regex = /[a-z]|[A-Z]|\d/;
        Parser.readRaw(__dirname, false).split("\n").forEach((r, ri) => {
            map[ri] = [];
            r.trim().split("").forEach((v, ci) => {
                map[ri].push(v);
                if (!regex.test(v)) return;
                if (!a[v]) {
                    a[v] = [];
                }
                a[v].push({ r: ri, c: ci });
            });
        });

        const countAntinodes = (a, b) => {
            let count = 0;
            const d = { r: b.r - a.r, c: b.c - a.c };
            const inBounds = (r, c) => c < map.length && r < map[0].length && c >= 0 && r >= 0;
            const countUpdate = (dr, dc) => {
                if (map[r][c] !== "#") {
                    count++;
                    map[r][c] = "#";
                }
                c += dc;
                r += dr;
            }

            let c = a.c, r = a.r;
            while (inBounds(r, c)) {
                countUpdate(d.r, d.c);
            }

            c = a.c;
            r = a.r;
            while (inBounds(r, c)) {
                countUpdate(-d.r, -d.c);
            }

            return count;
        }

        const count = (k) => {
            let sum = 0;
            for (let i = 0; i < a[k].length; i++) {
                for (let j = i + 1; j < a[k].length; j++) {
                    sum += countAntinodes(a[k][i], a[k][j]);
                }
            }
            return sum;
        }

        console.log("Result", Object.keys(a).map(count).reduce((a, c) => a + c, 0));
    }
}