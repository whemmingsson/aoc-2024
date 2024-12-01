const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const data = Parser.readRaw(__dirname, false).split("\n");

        let leftOrg = [];
        let rightOrg = [];
        data.forEach(line => {
            const r = line.match(/\d+/g);
            leftOrg.push(parseInt(r[0]));
            rightOrg.push(parseInt(r[1]));
        });

        // Part 1
        let left = [...leftOrg];
        let right = [...rightOrg];
        let distSum = 0;
        while (left.length > 0) {
            const smallestLeft = Math.min(...left);
            const smallestRight = Math.min(...right);
            distSum += Math.abs(smallestLeft - smallestRight);
            left.splice(left.indexOf(smallestLeft, 0), 1);
            right.splice(right.indexOf(smallestRight, 0), 1);
        }

        console.log("Part 1", distSum);

        // Part 2
        left = [...leftOrg];
        right = [...rightOrg];
        distSum = left.reduce((s, l) => s + (right.filter(r => r === l).length * l), 0);
        console.log("Part 2", distSum);
    };
}