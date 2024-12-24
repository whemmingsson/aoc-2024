
const Parser = require("../common/parser.js");

const wires = [];
const gates = [];
const wireMap = {};
const gateMap = {};

class Wire {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.originalValue = value;
    }

    getBit() {
        if (this.value === null) {
            throw new Error(`Cannot get unknown bit value for wire: ${this.id}`)
        }

        return this.value;
    }

    hasBit() {
        return this.value !== null;
    }

    setBit(v) {
        this.value = v;
    }

    reset() {
        this.value = this.originalValue;
    }
}

class Gate {
    constructor(w1, w2, opCode, out) {
        this.w1 = w1;
        this.w2 = w2;
        this.op = ops[opCode];
        this.out = out;
        this.outputValue = null;
        this.initalOut = out;
    }

    run() {
        let wire1 = wireMap[this.w1];
        let wire2 = wireMap[this.w2];
        let out = wireMap[this.out];

        let result = this.op(wire1.getBit(), wire2.getBit());
        out.setBit(result);
        this.outputValue = result;
        return this.outputValue;
    }

    canOutput() {
        let wire1 = wireMap[this.w1];
        let wire2 = wireMap[this.w2];
        return wire1.hasBit() && wire2.hasBit();
    }

    output() {
        if (this.outputValue) return this.outputValue;
        if (this.canOutput()) {
            return this.run();

        }

        return null; // Not yet ready to output
    }

    reset() {
        this.out = this.initalOut;
        this.outputValue = null;
    }
}

class WireGroup {
    constructor(wires) {
        this.wires = wires;

        this.sort(); // Sort ONCE
    }

    output() {
        if (this.wires.every(w => w.hasBit())) {
            return this.wires.map(w => w.getBit()).map(b => b ? "1" : "0").join();
        }

        return "NOT_READY";
    }

    sort() {
        this.wires.sort((a, b) => {
            let aa = parseInt(a.id.substring(1));
            let bb = parseInt(b.id.substring(1));
            return bb - aa;
        });
    }

    getDecimal() {
        if (this.output() === "NOT_READY") {
            return -1;
        }

        return BigInt(parseInt(this.wires.map(w => w.getBit()).map(b => b ? "1" : "0").join(""), 2));
    }

    add(otherGroup) {
        return BigInt(this.getDecimal()) + BigInt(otherGroup.getDecimal());
    }
}

const ops = {
    "AND": (b1, b2) => b1 && b2,
    "OR": (b1, b2) => b1 || b2,
    "XOR": (b1, b2) => b1 ^ b2
}

const USE_EXAMPLE = true;

const didAddition = (x, y, z) => {
    let sum = x.add(y);
    let expectedSum = z.getDecimal();
    console.log(sum, "=", expectedSum);
    return sum === expectedSum;
}

const reset = () => {
    wires.forEach(w => w.reset());
    gates.forEach(g => g.reset());
}

const run = (x, y, z) => {

    reset();
    while (z.output() === "NOT_READY") {
        gates.forEach(gate => {
            gate.output();
        });
    }
    console.log(didAddition(x, y, z));
}

const swapOutputWire = (i, j) => {
    if (i === j) { return; }

    let temp = gates[i].out;
    gates[i].out = gates[j].out;
    gates[j].out = temp;
}

module.exports = class Day {
    static run() {

        let outWires = [];
        Parser.readRaw(__dirname, USE_EXAMPLE)
            .split("\n")
            .map(v => v.trim())
            .forEach((v) => {
                if (v.indexOf(":") > 0) {
                    const wParts = v.split(": ").map(p => p.trim());
                    const wire = new Wire(wParts[0], wParts[1] === "1")
                    wires.push(new Wire(wParts[0], wParts[1] === "1"));
                    wireMap[wParts[0]] = wire;
                }
                else if (v.indexOf("->") > 0) {
                    const opRegex = /XOR|OR|AND/g;
                    const wireRegex = /[\da-z]{3}/g;
                    const wires = v.match(wireRegex);
                    const op = v.match(opRegex);
                    const gate = new Gate(wires[0], wires[1], op[0], wires[2]);
                    const inputs = [wires[0], wires[1]];

                    inputs.sort();
                    gates.push(gate);
                    gateMap[inputs.join("_")] = gate;
                    outWires.push(wires[2]);
                }
            });

        outWires.forEach(w => {
            if (wireMap[w]) return;
            let wire = new Wire(w, null);
            wireMap[w] = wire;
            wires.push(wire);
        });

        const targetOutputs = wires.filter(w => w.id[0] === "z");
        const inputX = wires.filter(w => w.id[0] === "x");
        const inputY = wires.filter(w => w.id[0] === "y");

        const z = new WireGroup(targetOutputs);
        const x = new WireGroup(inputX);
        const y = new WireGroup(inputY);

        let gl = gates.length;
        console.log(gl);
        for (let i = 0; i < gl; i++) {
            for (let j = i + 1; j < gl; j++) {
                swapOutputWire(i, j);
                run(x, y, z);
            }
        }
    }
}