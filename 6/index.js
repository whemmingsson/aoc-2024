const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const data = Parser.readRaw(__dirname, false);

        let matrix = [];
        let pos = { r: 0, c: 0 };
        let direction = { r: -1, c: 0 };
        const rows = data.split("\n");

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            matrix.push(row.split(""));
            if (row.indexOf("^") >= 0) {
                pos.r = i;
                pos.c = row.indexOf("^");
            }
        }

        const reset = () => {
            matrix = [];
            direction = { r: -1, c: 0 };
            const rows = data.split("\n");

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                matrix.push(row.split(""));
                if (row.indexOf("^") >= 0) {
                    pos.r = i;
                    pos.c = row.indexOf("^");
                }
            }
        }

        const turn90DegRight = () => {
            const { r, c } = direction;
            direction.r = c;
            direction.c = -r;
        }

        const isObstacleInFront = () => {
            const { r, c } = direction;
            const nextR = pos.r + r;
            const nextC = pos.c + c;
            return matrix[nextR] && matrix[nextR][nextC] === "#";
        }

        const outOfBounds = () => {
            return (
                pos.r < 0 ||
                pos.r >= matrix.length ||
                pos.c < 0 ||
                pos.c >= matrix[0].length
            );
        }

        const directionSymbol = () => {
            if (direction.c === 0 && direction.r === -1) return "U";
            if (direction.c === 0 && direction.r === 1) return "D";
            if (direction.c === -1 && direction.r === 0) return "L";
            if (direction.c === 1 && direction.r === 0) return "R";
            throw "BAD DIRECTION";
        }

        const isDirectionSymbol = () => {
            if (!matrix[pos.r]) {
                return true;
            }
            const s = matrix[pos.r][pos.c];
            return s === "U" || s === "D" || s === "L" || s === "R";
        }

        let visitedCells = 0;

        const move = () => {
            if (!isObstacleInFront()) {
                pos.r += direction.r;
                pos.c += direction.c;

                const s = matrix[pos.r] && matrix[pos.r][pos.c];

                if (!isDirectionSymbol()) {
                    visitedCells++;
                }
                else {
                    // IS direction symbol. Is is the same as current direction?
                    if (s === directionSymbol()) {
                        return "loop";
                    }

                }

                if (matrix[pos.r]) {
                    matrix[pos.r][pos.c] = directionSymbol();
                }
            } else {
                turn90DegRight();
            }

            return true;
        }

        while (!outOfBounds()) {
            const didMove = move();
            if (!didMove) {
                break;
            }
            else if (didMove === "loop") {
                break;
            }
        }

        console.log("Part 1", visitedCells);

        console.log("starting part 2");

        const s = new Date();
        let loopCount = 0;
        let counter = 0;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                reset();
                matrix[r][c] = "#";

                while (!outOfBounds()) {
                    const didMove = move();
                    if (!didMove) {
                        break;
                    }
                    else if (didMove === "loop") {
                        loopCount++;
                        break;
                    }
                }

                counter++;

                if (counter % 1000 === 0) {
                    console.log("Progress: ", Math.round(counter / (matrix.length * matrix[0].length) * 100) + "%");
                }
            }
        }

        console.log("Part 2", loopCount);
        console.log("Finished in", Math.round((new Date().getTime() - s.getTime()) / 1000), "seconds");
    }
}
