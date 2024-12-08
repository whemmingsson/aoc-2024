const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const map = [];
        const antennas = {};
        const regex = /[a-z]|[A-Z]|\d/;
        Parser.readRaw(__dirname, false).split("\n").forEach((r, ri) => {
            map[ri] = [];
            r.trim().split("").forEach((v, ci) => {
                map[ri].push(v);
                if (!regex.test(v)) return;
                if (!antennas[v]) {
                    antennas[v] = [];
                }
                antennas[v].push({ r: ri, c: ci });
            });
        });

        console.log(antennas);
        const w = map.length;
        console.log(w);

        const constructAntinodes = (a, b) => {
            const d = { r: b.r - a.r, c: b.c - a.c }
            const inBounds = (r, c) => c < map.length && r < map[0].length && c >= 0 && r >= 0;

            const antinodes = [];
            let c = a.c, r = a.r;
            while (inBounds(r, c)) {
                if (!foundAntiNodes[key({ r, c })]) antinodes.push({ r, c });
                c += d.c;
                r += d.r;
            }

            c = a.c;
            r = a.r;
            while (inBounds(r, c)) {
                const k = key({ r, c });
                if (!foundAntiNodes[key({ r, c })]) antinodes.push({ r, c });
                c -= d.c;
                r -= d.r;
            }
            return antinodes;
        }

        let totalAntiNodes = 0;
        let sneakyCount = 0;
        let foundAntiNodes = {};
        let key = (pos) => pos.r + "_" + pos.c;
        Object.keys(antennas).forEach(k => {
            for (let i = 0; i < antennas[k].length; i++) {
                for (let j = i + 1; j < antennas[k].length; j++) {
                    const nodes = constructAntinodes(antennas[k][i], antennas[k][j]);
                    for (let n = 0; n < nodes.length; n++) {
                        let antinode = nodes[n];
                        const nk = key(antinode);
                        console.log(antinode, map[antinode.r][antinode.c]);
                        if (!foundAntiNodes[nk]) {
                            foundAntiNodes[nk] = true;
                            totalAntiNodes++;
                        }
                        else {
                            console.log("    Sneaky", antinode, map[antinode.r][antinode.c]);
                            sneakyCount++;
                        }
                    }
                }
            }
        });

        console.log("Result", totalAntiNodes, sneakyCount);
    }
}