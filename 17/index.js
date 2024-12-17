
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

            console.log("ERROR! 7 is not a known combo operand");
        }

        const doDivision = (register, p) => {
            const numerator = registers.A;
            const cov = getComboOperandValue(p);
            const denominator = Math.pow(2, cov);
            const result = Math.floor(numerator / denominator);
            //console.log("numerator:", numerator, "denominator:", denominator, "was aquired by raising", 2, "to the power of", cov);
            writeToRegister(register, result);
        }

        const out = [];
        const operations = {
            0: (p) => {
                // adv
                // The adv instruction (opcode 0) performs division. The numerator is the value in the A register. The denominator is found by raising 2 to the power of the instruction's combo operand. 
                // (So, an operand of 2 would divide A by 4 (2^2); an operand of 5 would divide A by 2^B.) The result of the division operation is truncated to an integer and then written to the A register.
                doDivision("A", p);
                return true;
            },
            1: (p) => {
                //bxl
                // The bxl instruction (opcode 1) calculates the bitwise XOR of register B and the instruction's literal operand, then stores the result in register B.
                const lov = getOperand(p);
                const regB = registers.B;
                writeToRegister("B", lov ^ regB);
                return true;
            },
            2: (p) => {
                // bst
                const cov = getComboOperandValue(p);
                writeToRegister("B", cov % 8);
                return true;
            },
            3: (p) => {
                //jnz
                if (registers.A === 0) return true;
                const lov = getOperand(p);
                //console.log("Jumping from", pointer, "to", lov);
                pointer = lov;
                return false;
            },
            4: (p) => {
                //bxc
                const res = registers.B ^ registers.C;
                writeToRegister("B", res);
                return true;
            },
            5: (p) => {
                //out
                const cov = getComboOperandValue(p);
                const res = cov % 8;
                out.push(res);
                return true;
            },
            6: (p) => {
                //bdv
                doDivision("B", p);
                return true;
            },
            7: (p) => {
                //cdv
                doDivision("C", p);
                return true;
            },
        }

        let pointer = 0;
        const runProgram = () => {
            console.log("STARTING PROGRAM");
            console.log(registers);
            console.log(program);
            while (true) {
                try {
                    const opCode = getOpCode(pointer);
                    //console.log("Found opCode", opCode, "at pointer:", pointer);
                    const operation = operations[opCode];
                    if (operation(pointer)) {
                        pointer += 2;
                    }
                    console.log(" Registers after op:", registers)
                }
                catch (e) {
                    //console.log("Tried to read outside program, HALT", e);
                    break;
                }
            }

            console.log("Pointer:", pointer);
            console.log("Registers:", registers);
            console.log("out:", out.join(","))
        }

        runProgram();
    }
}

// Too low: 56865584425514
// Too low: 70555290965673