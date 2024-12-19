
const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const data = Parser.readRaw(__dirname, false);
        const lines = data.split("\n");

        let patternsMap = {};
        let designs = [];

        lines[0].trim()
            .split(",")
            .map((p) => p.trim())
            .forEach((p) => {
                if (p)
                    patternsMap[p] = true;
            });

        for (let i = 2; i < lines.length; i++) {
            designs.push(lines[i].trim());
        }

        console.log("Patterns:", patternsMap);
        console.log("Designs", designs);

        let invalidStartIndices = {};
        const validateDesign = (design, startIndex) => {
            if (invalidStartIndices[startIndex]) return false;

            let patternLength = 1;
            let patternToTest = design.substring(startIndex, startIndex + patternLength);

            for (let i = 0; i < design.length - startIndex; i++) {
                if (
                    patternsMap[patternToTest] &&
                    startIndex + patternLength === design.length
                ) {
                    patternsMap[design] = true;
                    return true;
                } else if (patternsMap[patternToTest]) {
                    let tailPartsValid = validateDesign(
                        design,
                        startIndex + patternLength
                    );

                    if (tailPartsValid) {
                        return true;
                    }
                }

                patternLength++;
                patternToTest = design.substring(startIndex, startIndex + patternLength);
            }


            invalidStartIndices[startIndex] = true;
            return false;
        };

        const validateDesignAlt = (design, end) => {
            let len = 1;
            let pattern = design.substring(end - len, end);

            while (!patternsMap[pattern] && len <= design.length) {
                console.log("Testing", pattern);
                len++;
                pattern = design.substring(end - len, end);
            }

            if (len >= design.length) {
                console.log("Tested whole string, it was invalid")
                return false;
            }

            // Pattern was valid
            console.log(pattern, "was valid");


        }

        const isDesignValid = (design) => {
            invalidStartIndices = {};
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
        //console.log("Valid patterns:", patternsMap)
        //console.log("invalid patterns:", invalidPatterns)
    }
}