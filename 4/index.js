const Parser = require("../common/parser.js");
module.exports = class Day {

    static part1(mtx) {
        const countXMAS = (characters) => {
            if (characters.length < 4) return 0;
            const word = characters.join("");
            return (word.match(/XMAS/g) ?? []).length + (word.match(/SAMX/g) ?? []).length;
        }

        let inRows = mtx.map(r => countXMAS(r)).reduce((a, c) => a + c, 0);
        let inCols = [...Array(mtx[0].length).keys()].map(c => countXMAS([...mtx.map(l => l[c])])).reduce((a, c) => a + c, 0);

        let inDiagonals = 0;

        const getDiagonal = (h, rFunc, cFunc) => [...Array(h).keys()].map(i => mtx[rFunc(i)][cFunc(i)]);

        let r = 0;
        for (let h = mtx.length; h >= 0; h--) {
            inDiagonals += countXMAS(getDiagonal(h, (i) => i + r, (i) => i));
            r++;
        }

        let c = 1;
        for (let h = mtx.length - 1; h >= 0; h--) {
            inDiagonals += countXMAS(getDiagonal(h, (i) => i, (i) => i + c));
            c++;
        }

        r = 0;
        for (let h = mtx.length; h >= 0; h--) {
            inDiagonals += countXMAS(getDiagonal(h, (i) => r + i, (i) => mtx[0].length - 1 - i));
            r++;
        }

        c = mtx[0].length - 2;
        for (let h = mtx.length - 1; h >= 0; h--) {
            inDiagonals += countXMAS(getDiagonal(h, (i) => i, (i) => c - i));
            c--;
        }

        return inRows + inCols + inDiagonals;
    }

    static part2(mtx) {
        let sum = 0;

        for (let r = 1; r < mtx.length - 1; r++) {
            for (let c = 1; c < mtx[r].length - 1; c++) {
                sum += mtx[r][c] === "A"
                    && (mtx[r - 1][c - 1] === "M" && mtx[r + 1][c + 1] === "S" || mtx[r - 1][c - 1] === "S" && mtx[r + 1][c + 1] === "M")
                    && (mtx[r - 1][c + 1] === "M" && mtx[r + 1][c - 1] === "S" || mtx[r - 1][c + 1] === "S" && mtx[r + 1][c - 1] === "M")
            }
        }

        return sum;
    }

    static run() {
        const mtx = [];
        Parser.readRaw(__dirname, false).split("\n").forEach((l) => {
            mtx.push([...l.trimEnd().split("")]);
        });

        console.log("Part 1", this.part1(mtx));
        console.log("Part 2", this.part2(mtx));
    };
}