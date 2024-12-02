const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {

        const result = [];
        Parser.readRaw(__dirname, false).split("\n").forEach(line => {
            result.push(line.match(/\d+/g).map(v => parseInt(v)))

        });

        const isIncreasing = (a, b) => {
            return b < a;
        }

        const isDecreasing = (a, b) => {
            return b > a;
        }

        const isUnsafe = (report) => {
            let isDec, isInc = false;

            for (let i = 0; i < report.length - 1; i++) {
                const l1 = report[i], l2 = report[i + 1];
                if (Math.abs(l1 - l2) > 3) {
                    console.log(l1, l2, `distance is greater than 3`)
                    return true;
                }

                if (l1 === l2) {
                    console.log(l1, l2, `are equal`)
                    return true;
                }

                const isD = isDecreasing(l1, l2);
                const isI = isIncreasing(l1, l2);

                if (i === 0) {
                    isDec = isD;
                    isInc = isI;
                    continue;
                }

                if (isDec && isI || isInc && isD) {
                    console.log(l1, l2, "broke pattern")
                    return true;
                }
            }

            return false;
        }

        // Part 1
        const unsafeReports = result.filter(isUnsafe);
        const safeReportCount = result.length - unsafeReports.length;
        console.log("Part 1", safeReportCount);

        // Part 2
        let safeWithDampeningCount = 0;
        unsafeReports.forEach(report => {
            for (let i = 0; i < report.length; i++) {
                const nReport = [...report];
                nReport.splice(i, 1);
                console.log("Testing:", nReport);
                const unsafe = isUnsafe(nReport);
                if (!unsafe) {
                    console.log(nReport, "is actually safe!")
                    safeWithDampeningCount++;
                    break;
                }
            }
        })

        console.log("Part 2", safeWithDampeningCount + safeReportCount);

    };
}