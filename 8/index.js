const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const map = [];
        Parser.readRaw(__dirname, false).split("\n").forEach(r => {
            map.push([...r.trim().split("")]);
        })

        const antennas = {};
        const regex = /[a-z]|[A-Z]|\d/;
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[r].length; c++) {
                const v = map[r][c];
                if (!regex.test(v)) continue;
                if (!antennas[v]) {
                    antennas[v] = [];
                }
                antennas[v].push({ r, c });
            }
        }

        const dist = (a, b) => {
            return { r: a.r - b.r, c: a.c - b.c }
        }

        const isValidAntinode = (pos) => map[pos.r] && map[pos.r][pos.c] && map[pos.r][pos.c] !== "#";

        const constructAntinodes = (a, b, part1) => {
            const d = dist(b, a);
            if (part1) {
                return [{ c: a.c - d.c, r: a.r - d.r }, { c: b.c + d.c, r: b.r + d.r }];
            }

            const antinodes = [];
            let c = a.c, r = a.r;
            while (c <= map.length && r <= map[0].length) {
                antinodes.push({ r, c });
                c += d.c;
                r += d.r;
            }

            c = a.c;
            r = a.r;
            while (c >= 0 && r >= 0) {
                antinodes.push({ r, c });
                c -= d.c;
                r -= d.r;
            }
            return antinodes;
        }

        let totalAntiNodes = 0;
        Object.keys(antennas).forEach(antenna => {
            for (let i = 0; i < antennas[antenna].length; i++) {
                for (let j = i + 1; j < antennas[antenna].length; j++) {
                    constructAntinodes(antennas[antenna][i], antennas[antenna][j], false)
                        .filter(isValidAntinode)
                        .forEach(antinode => {
                            if (map[antinode.r][antinode.c] !== "#") {
                                map[antinode.r][antinode.c] = "#";
                                totalAntiNodes++;
                            }
                        });
                }
            }
        });

        map.forEach(r => {
            console.log(r.join(""));
        });

        console.log("Result", totalAntiNodes);
    }
}