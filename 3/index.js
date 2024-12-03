const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const data = Parser.readRaw(__dirname, false);
        let regex = /mul\(\d+,\d+\)/gm;

        let arr;
        const instructions = [];
        while ((arr = regex.exec(data)) !== null) {
            instructions.push({
                index: arr.index,
                product: arr[0].match(/\d+/g).map(v => parseInt(v)).reduce((p, c) => p * c, 1)
            });
        }

        console.log("Part 1", instructions.map(i => i.product).reduce((a, c) => a + c, 0));

        const validInstructions = [];
        let isDo = true;
        let idx = 0;
        instructions.forEach(ins => {
            const searchSpace = data.substring(idx, ins.index);
            const foundDo = searchSpace.lastIndexOf("do()") >= 0;
            const foundDont = searchSpace.lastIndexOf("don't()") >= 0;
            let isValid = true;

            if (foundDo) {
                isValid = true;
                isDo = true;
            }
            else if (foundDont) {
                isValid = false;
                isDo = false;
            }
            else {
                isValid = isDo;
            }

            if (isValid) {
                validInstructions.push(ins);
            }

            idx = ins.index;
        })

        console.log("Part 2", validInstructions.map(i => i.product).reduce((a, c) => a + c, 0));
    };
}