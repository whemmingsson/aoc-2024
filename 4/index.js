const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {

        const countXMAS = (characters) => {
            if (characters.length < 4) return 0;
            const word = characters.join("");
            return (word.match(/XMAS/g) ?? []).length + (word.match(/SAMX/g) ?? []).length;
        }

        const mtx = [];
        const data = Parser.readRaw(__dirname, false).split("\n");
        data.forEach((l) => {
            const line = [];
            l.trimEnd().split("").forEach(c => {
                line.push(c);
            })
            mtx.push(line);
        })

        // Count in rows
        let inRows = 0;
        mtx.forEach(r => {
            inRows += countXMAS(r);
        })

        // Count in columns
        let inCols = 0;
        for (let c = 0; c < mtx[0].length; c++) {
            inCols += countXMAS([...mtx.map(l => l[c])]);
        }

        let inDiagonals = 0;
        let h = mtx.length;
        let c = 0;
        let r = 0;

        while (h > 0) {
            let d = [];
            for (let i = 0; i < h; i++) {
                d.push(mtx[i + r][i])
            }
            inDiagonals += countXMAS(d);
            h--;
            r++;
        }

        h = mtx.length - 1;
        c++;
        while (h > 0) {
            let d = [];
            for (let i = 0; i < h; i++) {
                d.push(mtx[i][i + c])
            }
            inDiagonals += countXMAS(d);
            h--;
            c++;
        }

        h = mtx.length;
        c = mtx[0].length - 1;
        r = 0;

        while (h > 0) {
            let d = [];
            for (let i = 0; i < h; i++) {
                d.push(mtx[r + i][c - i])
            }
            inDiagonals += countXMAS(d);
            h--;
            r++;
        }

        h = mtx.length - 1;
        c = mtx[0].length - 2;
        r = 0;
        while (h > 0) {
            let d = [];
            for (let i = 0; i < h; i++) {
                d.push(mtx[r + i][c - i])
            }
            inDiagonals += countXMAS(d);
            h--;
            c--;
        }

        console.log("Part 1", inRows + inCols + inDiagonals);

    };
}