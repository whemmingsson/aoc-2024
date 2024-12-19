
const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const data = Parser.readRaw(__dirname, true);
        const lines = data.split("\n");

        let patterns = new Set();
        let designs = [];

        lines[0].trim()
            .split(",")
            .map((p) => p.trim())
            .forEach((p) => {
                if (p) {
                    patterns.add(p);
                }
            });

        for (let i = 2; i < lines.length; i++) {
            designs.push(lines[i].trim());
        }

        let invalidStartIndices = new Set();
        const validateDesign = (design, idx) => {
            if (invalidStartIndices.has(idx)) return false;

            let len = 1;
            let pattern = design.substring(idx, idx + len);

            for (let i = 0; i < design.length - idx; i++) {
                if (
                    patterns.has(pattern) &&
                    idx + len === design.length
                ) {
                    return true;
                } else if (patterns.has(pattern) && validateDesign(design, idx + len)) {
                    return true;
                }

                len++;
                pattern = design.substring(idx, idx + len);
            }

            invalidStartIndices.add(idx)
            return false;
        };

        const isDesignValid = (design) => {
            invalidStartIndices = new Set();
            return validateDesign(design, 0);
        };

        let validDesigns = [];
        designs.forEach((design) => {
            let isValid = isDesignValid(design);
            if (isValid) {
                validDesigns.push(design);
            }
            console.log("Design:", design, isValid);
        });

        console.log("Valid count:", validDesigns.length);
    }
}