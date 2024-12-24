
const Parser = require("../common/parser.js");

const wires = [];
const gates = [];
const wireMap = {};
const gateMap = {};

class Wire {
    constructor(id, value) {
        this.id = id;
        this.value = value;
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
}

class Gate {
    constructor(w1, w2, opCode, out) {
        this.w1 = w1;
        this.w2 = w2;
        this.type = opCode;
        this.op = ops[opCode];
        this.out = out;
        this.outputValue = null;
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
}

class WireGroup {
    constructor(wires) {
        this.wires = wires;
    }

    output() {
        if (this.wires.every(w => w.hasBit())) {
            return this.wires.map(w => w.getBit()).map(b => b ? "1" : "0").join();
        }

        return "NOT_READY";
    }

    getDecimal() {
        this.wires.sort((a, b) => {
            let aa = parseInt(a.id.substring(1));
            let bb = parseInt(b.id.substring(1));
            return bb - aa;

        });

        return parseInt(this.wires.map(w => w.getBit()).map(b => b ? "1" : "0").join(""), 2);
    }
}

const ops = {
    "AND": (b1, b2) => b1 && b2,
    "OR": (b1, b2) => b1 || b2,
    "XOR": (b1, b2) => b1 ^ b2
}

const USE_EXAMPLE = false;

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
                    let opRegex = /XOR|OR|AND/g;
                    let wireRegex = /[\da-z]{3}/g;

                    let wires = v.match(wireRegex);
                    let op = v.match(opRegex);
                    let gate = new Gate(wires[0], wires[1], op[0], wires[2]);
                    let inputs = [wires[0], wires[1]];
                    inputs.sort();
                    let gateKey = inputs.join("_");
                    gates.push(gate);
                    gateMap[gateKey] = gate;
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
        const group = new WireGroup(targetOutputs);
        while (group.output() === "NOT_READY") {
            gates.forEach(gate => {
                gate.output();
            });

        }
        console.log(group.getDecimal())

    }
}