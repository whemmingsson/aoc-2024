
const Parser = require("../common/parser.js");
const fs = require("fs");
module.exports = class Day {
    static run() {
        const registers = {};

        const data = Parser.readRaw(__dirname, false);

        data.match(/[ABC]+:\s\d*/g).forEach(r => {
            const s = r.split(":").map(r => r.trim());
            registers[s[0]] = parseInt(s[1]);
        });

        const programRow = data.match(/Program:\s[\d+,?]+/g);
        const program = programRow[0].split(":")[1].split(",").map(v => parseInt(v.trim()));

        const getOpCode = (p) => {
            if (p >= program.length) {
                throw new Error("HALT due to program end");
            }
            return program[p];
        }

        const getOperand = (p) => {
            return program[p + 1];
        }

        const writeToRegister = (reg, v) => {
            registers[reg] = v;
        }

        const getComboOperandValue = (p) => {
            const v = getOperand(p);
            if (v >= 0 && v <= 3) return v;
            if (v === 4) return registers.A;
            if (v === 5) return registers.B;
            if (v === 6) return registers.C;
        }

        const doDivision = (register, p) => {
            const numerator = registers.A;
            const cov = getComboOperandValue(p);
            const denominator = Math.pow(2, cov);
            const result = Math.floor(numerator / denominator);
            writeToRegister(register, result);
        }

        let out = [];
        const operations = {
            0: (p) => {
                doDivision("A", p);
                return true;
            },
            1: (p) => {
                const lov = getOperand(p);
                const regB = registers.B;
                writeToRegister("B", lov ^ regB);
                return true;
            },
            2: (p) => {
                const cov = getComboOperandValue(p);
                writeToRegister("B", cov % 8);
                return true;
            },
            3: (p) => {
                if (registers.A === 0) return true;
                const lov = getOperand(p);
                pointer = lov;
                return false;
            },
            4: (p) => {
                const res = registers.B ^ registers.C;
                writeToRegister("B", res);
                return true;
            },
            5: (p) => {
                const cov = getComboOperandValue(p);
                const res = cov % 8;
                /*if (res !== program[out.length]) {
                    // Invalid output. Must match program op code at this position
                    throw new Error("Invalid starting registry");
                } */

                out.push(res);
                if (out.length === program.length) {
                    throw new Error("Found input. Yaaay!");
                }

                return true;
            },
            6: (p) => {
                doDivision("B", p);
                return true;
            },
            7: (p) => {
                doDivision("C", p);
                return true;
            },
        }

        const runWithInitialA = (initialA) => {
            out = [];
            registers.A = initialA;
            pointer = 0;
            let stepsBeforeHalt = 0;
            while (true) {
                try {
                    const opCode = getOpCode(pointer);
                    const operation = operations[opCode];
                    if (operation(pointer)) {
                        pointer += 2;
                    }
                    stepsBeforeHalt++;
                }
                catch (e) {
                    registerStats(initialA, stepsBeforeHalt)
                    break;
                }
            }
        }

        const stats = [];
        const registerStats = (initialA, stepsBeforeHalt) => {
            //if (stepsStats[stepsBeforeHalt]) return;

            // Interesting parameters: pointer, length of out, contents of out
            let stat = { A: initialA, s: stepsBeforeHalt, l: out.length, out: out.join(",") };
            stepsStats[stepsBeforeHalt] = stat;



            stats.push(stat);
        }

        const dumpStats = () => {
            let file = "";

            stats.forEach(s => {
                let line = Object.values(s).join(";");
                file += line + "\n";
            })

            fs.writeFileSync("dump.txt", file);
        }

        let pointer = 0;
        let registerA = 0;
        let count = 0;
        let start = 0;
        let tries = 11744 + 1;
        let stepsStats = {};

        count = start;
        registerA = start;
        const runProgram = () => {
            console.log("STARTING PROGRAM");
            console.log(registers);
            console.log(program);
            while (count < start + tries) {
                runWithInitialA(registerA);
                count++;

                if (out.length === program.length) {
                    console.log("out", out, "registerA:", registerA);
                    break;
                }
                registerA++;
            }

            dumpStats();
        }

        runProgram();
        //runWithInitialA(35184372088832);
        //dumpStats();
    }
}

// Too low: 41113000
// Too low: 1526178000