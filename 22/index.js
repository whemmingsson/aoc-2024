
const Parser = require("../common/parser.js");

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
            const s = new Sequence();
            let priceTable = [];
            let next = inital;
            let prevPrice = Number(getPrice(BigInt(inital)));
            priceTable.push({ p: prevPrice, d: null });
            for (let i = 0; i < n - 1; i++) {
                next = getNextSecretNumber(next);
                let price = Number(getPrice(next));
                let diff = price - prevPrice;
                s.add(diff);

                priceTable.push({ p: price, d: diff, s: s.getValues() });
                prevPrice = price
            }

            return priceTable;
        }

        const buildPriceSequenceMap = (table) => {
            const map = {};
            let sequenceStr = (list) => {
                if (!list) return "";
                return list.join(",");
            }
            table.forEach(entry => {
                if (!map[entry.p]) {
                    map[entry.p] = [];
                }
                map[entry.p].push(sequenceStr(entry.s));
            });

            return map;
        }

        const bi_10 = BigInt(10);
        const getPrice = (v) => {
            return v % bi_10;
        }

        const part1 = () => {
            console.log(initalSecretNumbers.map(sn => getNthSecretNumber(sn, 2000)).reduce((a, c) => a + c, BigInt(0)));
        }

        const calcTotalBestPrice = (inital, n) => {
            let getSequenceKey = (list) => {
                if (!list || list.length < 4) return null;
                return list.join(",");
            }
            const s = new Sequence();
            let next = inital;
            let prevPrice = Number(getPrice(BigInt(inital)));
            let bestLocal = {};
            for (let i = 0; i < n - 1; i++) {
                next = getNextSecretNumber(next);
                let price = Number(getPrice(next));
                let diff = price - prevPrice;

                s.add(diff);

                let sequenceKey = getSequenceKey(s.getValues());

                if (sequenceKey) {
                    if (price >= (bestLocal[sequenceKey] ?? 0)) {
                        bestLocal[sequenceKey] = price;
                    }
                }

                prevPrice = price
            }

            Object.keys(bestLocal).forEach(k => {
                let v = bestLocal[k];
                if (!bigMap[k]) {
                    bigMap[k] = [];
                }
                bigMap[k].push(v);
            })
        }

        // Part 2 - construct the "tables" list
        const bigMap = {};
        const part2 = () => {
            initalSecretNumbers.forEach((initial) => {
                calcTotalBestPrice(initial, 2000);
            })

            let max = 0;
            let bestSeq = "";
            Object.keys(bigMap).forEach(k => {
                let v = bigMap[k];
                let s = v.reduce((a, c) => a + c, 0);
                if (s > max) {
                    max = s;
                    bestSeq = k;
                }
            });

            console.log(max, bestSeq);
        }

        part2();

    }
}

// 1861 (too big)

// 1748 (too high...still)

// 1705 (too high, still)