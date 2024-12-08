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
        const w = map.length;
        const h = map[0].length;

        const dist = (a, b) => {
            return { r: a.r - b.r, c: a.c - b.c }
        }

        const isAntinodeAt = (pos) => map[pos.r][pos.c] === "#";

        const isValidAntinode = (pos) => pos.c >= 0 && pos.c <= w - 1 && pos.r >= 0 && pos.r <= h - 1 && !isAntinodeAt(pos);

        const constructAntinodes = (a, b) => {
            const d = dist(b, a);
            return [{ c: a.c - d.c, r: a.r - d.r }, { c: b.c + d.c, r: b.r + d.r }];
        }

        let totalAntiNodes = 0;
        Object.keys(antennas).forEach(antenna => {
            const positions = antennas[antenna];
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    constructAntinodes(positions[i], positions[j]).filter(isValidAntinode).forEach(an => {
                        map[an.r][an.c] = "#";
                        totalAntiNodes++;
                    });
                }
            }
        });

        console.log("Part 1", totalAntiNodes);
    }
}