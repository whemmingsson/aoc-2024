
const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const data = Parser.readRaw(__dirname, false);
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

        let m = new Set();
        const validate = (d, s) => {
            if (m.has(s)) return false;

            for (let i = 1; i < d.length - s + 1; i++) {
                const v = patterns.has(d.substring(s, s + i))
                if ((v && s + i === d.length) || (v && validate(d, s + i)))
                    return true;
            }

            m.add(s)
            return false;
        };

        let c = {};
        const count = (d, s) => {
            if (c[s]) {
                return c[s];
            }

            let t = 0;
            for (let i = 1; i < d.length - s + 1; i++) {
                const v = patterns.has(d.substring(s, s + i));
                if (v && s + i === d.length)
                    t++;
                else if (v)
                    t += count(d, s + i);
            }

            c[s] = t;
            return t;
        };

        const isDesignValid = (design) => {
            m = new Set();
            return validate(design, 0);
        };

        const countOptionsAux = (design) => {
            c = {};
            return count(design, 0, 0);
        };

        let validDesigns = designs.filter((design) => isDesignValid(design));
        console.log("Valid count:", validDesigns.length);
        console.log("Total options:", validDesigns.map(design => countOptionsAux(design)).reduce((a, c) => a + c, 0));
    }
}