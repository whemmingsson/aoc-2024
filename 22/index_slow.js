
const Parser = require("../common/parser.js");
const fs = require("fs");

class Sequence {
    constructor() {
        this.values = [];
    }

    add(v) {
        if (!this.isFull()) {
            this.values.push(v);
        }
        else {
            this.values.shift();
            this.values.push(v);
        }
    }

    isFull() {
        return this.values.length === 4;
    }

    getValues() {
        if (!this.isFull()) {
            throw new Error("Trying to get values for sequence when it's not full")
        }
        return [...this.values];
    }
}
module.exports = class Day {
    static run() {
        const initalSecretNumbers = Parser.readRaw(__dirname, false)
            .split("\n")
            .map(v => parseInt(v.split()));

        const bi_mod = BigInt(16777216);
        const prune = (n) => {
            return n % bi_mod;
        }

        const mix = (v, s) => {
            return v ^ s;
        }

        const bi_64 = BigInt(64);
        const bi_32 = BigInt(32);
        const bi_2048 = BigInt(2048);

        const getNextSecretNumber = (n) => {
            let nn = BigInt(n);
            nn = mix(nn * bi_64, nn);
            nn = prune(nn);
            nn = mix(nn / bi_32, nn);
            nn = prune(nn);
            nn = mix(nn * bi_2048, nn);
            nn = prune(nn);
            return nn;
        }

        const getNthSecretNumber = (inital, n) => {
            let next = inital;
            for (let i = 0; i < n; i++) {
                next = getNextSecretNumber(next);
            }

            return next;
        }

        const getPriceTableLengthN = (inital, n) => {
            let getSequenceKey = (list) => {
                if (!list || list.length < 4) return null;
                return list.join(",");
            }
            const s = new Sequence();
            let priceTable = [];
            let next = inital;
            let prevPrice = Number(getPrice(BigInt(inital)));
            let seq = new Set();
            for (let i = 0; i < n - 1; i++) {
                next = getNextSecretNumber(next);
                let price = Number(getPrice(next));
                let diff = price - prevPrice;

                s.add(diff);

                if (s.isFull()) {
                    let key = getSequenceKey(s.getValues());
                    if (!seq.has(key)) {
                        priceTable.push({ price: price, diff: diff, sequence: getSequenceKey(s.getValues()) });
                        seq.add(key);
                    }
                }

                prevPrice = price;
            }
            return priceTable;
        }


        const bi_10 = BigInt(10);
        const getPrice = (v) => {
            return v % bi_10;
        }

        const part1 = () => {
            console.log(initalSecretNumbers.map(sn => getNthSecretNumber(sn, 2000)).reduce((a, c) => a + c, BigInt(0)));
        }

        // Part 2 - construct the "tables" list
        let bestSequences = [];
        const part2 = () => {
            let getSequenceKey = (list) => {
                if (!list || list.length < 4) return null;
                return list.join(",");
            }

            initalSecretNumbers.forEach((initial) => {
                let table = getPriceTableLengthN(initial, 2000);

                let bestForBuyer = {};
                table.forEach(t => {
                    bestForBuyer[t.sequence] = -9999;
                })

                table.forEach(t => {
                    if (t.price > bestForBuyer[t.sequence]) {
                        bestForBuyer[t.sequence] = t.price;
                    }
                });
                bestSequences.push(bestForBuyer);
            });


            let bestSum = 0;
            for (let a = -9; a < 10; a++) {
                for (let b = -9; b < 10; b++) {
                    for (let c = -9; c < 10; c++) {
                        for (let d = -9; d < 10; d++) {
                            let k = getSequenceKey([a, b, c, d]);
                            let sum = 0;
                            for (let i = 0; i < bestSequences.length; i++) {
                                let seqs = bestSequences[i];
                                let price = seqs[k];
                                if (price) {
                                    sum += price;
                                }
                            }

                            if (sum > bestSum) {
                                bestSum = sum;
                                console.log("Found new best sum for sequence", k, sum);
                            }
                        }
                    }
                }
            }

            console.log("Best sum:", bestSum);
        }

        part2();

    }
}

// 1861 (too big)

// 1748 (too high...still)

// 1705 (too high, still)

// Bozjak:
// 2089
// My code produces: 2077
// The best sequence (correct answer): 2069