
const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const stones = Parser.readRaw(__dirname, false)
            .trim()
            .split(" ")
            .map((v) => parseInt(v));

        let totalStones = stones.length;

        const isEvenNumberOfDigits = (stone) => {
            return stone.toString().length % 2 === 0;
        }

        const split = (stoneStr) => {
            const len = stoneStr.length / 2;
            const left = stoneStr.slice(0, len);
            const right = stoneStr.slice(len, stoneStr.length);
            return { left, right };
        }

        const blink = () => {
            const stonesToSplit = [];
            for (let i = 0; i < stones.length; i++) {
                const stone = stones[i];

                if (stone === 0) {
                    stones[i] = 1;
                }
                else if (isEvenNumberOfDigits(stone)) {
                    stonesToSplit.push({ index: i, stone });
                }
                else {
                    stones[i] = stone * 2024;
                }
            }

            for (let j = stonesToSplit.length - 1; j >= 0; j--) {
                const { stone, index } = stonesToSplit[j];
                const stoneStr = stone.toString();
                const newStones = split(stoneStr);
                stones[index] = parseInt(newStones.left);
                stones.splice(index + 1, 0, parseInt(newStones.right));
                totalStones++;
            }
        }

        console.log("Initial stones")
        console.log(stones);
        for (let i = 0; i < 25; i++) {
            blink();
            console.log("After", i + 1, "blinks");
            console.log(totalStones);
        }

    }
}
