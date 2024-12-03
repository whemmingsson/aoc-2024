const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {

        const data = Parser.readRaw(__dirname, false);
        let regex = /mul\(\d+,\d+\)/gm;

        let myArray;
        const instructions = [];
        while ((myArray = regex.exec(data)) !== null) {
            instructions.push({
                index: myArray.index,
                product: myArray[0].match(/\d+/g).map(v => parseInt(v)).reduce((p, c) => p * c, 1),
                raw: myArray[0]
            });
        }

        console.log("Part 1", instructions.map(i => i.product).reduce((a, c) => a + c, 0));

        const validInstructions = [];
        let isDo = true;
        let idx = 0;
        const doIns = "do()";
        const dontIns = "don't()";
        instructions.forEach(ins => {
            const searchSpace = data.substring(idx, ins.index);
            const lastIndexOfDo = searchSpace.lastIndexOf(doIns);
            const lastIndexOfDont = searchSpace.lastIndexOf(dontIns);
            let mode = true;

            if (lastIndexOfDo > 0) {
                isDo = mode;
            }
            else if (lastIndexOfDont > 0) {
                mode = false;
            }
            else if (!isDo) {
                mode = false;
            }

            if (mode) {
                validInstructions.push(ins);
            }

            if (lastIndexOfDont > 0 && isDo) {
                isDo = false;
            }
            else if (lastIndexOfDo > 0 && !isDo) {
                isDo = true;
            }

            idx = ins.index;
        })

        console.log("Part 2", validInstructions.map(i => i.product).reduce((a, c) => a + c, 0));
    };
}