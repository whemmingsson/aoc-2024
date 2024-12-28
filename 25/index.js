
const Parser = require("../common/parser.js");

const USE_EXAMPLE = false;

const keys = [];
const locks = [];
const HEIGHT = 7;

class Key {
    constructor(pins) {
        this.pins = pins;
    }

    toString() {
        this.pins;
    }
}


class Lock {
    constructor(pins) {
        this.pins = pins;
    }

    canBeUnlockedWith(key) {
        for (let i = 0; i < this.pins.length; i++) {
            let lPin = this.pins[i];
            let kPin = key.pins[i];
            if (lPin + kPin >= HEIGHT - 1) {
                return false;
            }
        }
        return true;
    }

    toString() {
        this.pins;
    }
}

module.exports = class Day {
    static run() {

        const rows = Parser.readRaw(__dirname, USE_EXAMPLE)
            .split("\n").map(r => r.trim());

        const isStartOfKey = (r) => {
            return r.split("").every(c => c === ".")
        }

        const isStartOfLock = (r) => {
            return r.split("").every(c => c === "#")
        }

        const getPins = (startIndex, char) => {
            let mtx = [];
            for (let i = startIndex; i < startIndex + HEIGHT; i++) {
                let r = rows[i];
                mtx.push(r.split(""));
            }
            let w = mtx[0].length;
            let pinHeights = [];
            for (let x = 0; x < w; x++) {
                let height = 0;
                for (let y = 0; y < HEIGHT; y++) {
                    if (mtx[y][x] === char) { height++; }
                }

                pinHeights.push(height - 1);
            }
            return pinHeights;
        }

        const createLock = (startIndex) => {
            return new Lock(getPins(startIndex, "#"));
        }

        const createKey = (startIndex) => {
            return new Key(getPins(startIndex, "#"));
        }

        for (let i = 0; i < rows.length; i++) {
            let r = rows[i];
            if (!r) continue;

            if (isStartOfKey(r)) {
                keys.push(createKey(i));
                i += HEIGHT;
            }

            if (isStartOfLock(r)) {
                locks.push(createLock(i));
                i += HEIGHT;
            }
        }

        let count = 0;
        locks.forEach(lock => {
            keys.forEach(key => {
                let canUnlock = lock.canBeUnlockedWith(key);
                console.log("Lock:", lock, "key:", key, canUnlock ? "YES" : "NO");
                if (canUnlock) {
                    count++;
                }
            })
        })

        console.log("Part 1", count);

    }
}