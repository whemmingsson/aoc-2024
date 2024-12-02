const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {

        const result = [];
        Parser.readRaw(__dirname, false).split("\n").forEach(line => {
            result.push(line.match(/\d+/g).map(v => parseInt(v)))
        });

        const isUnsafe = (report) => {
            let isDec, isInc = false;

            for (let i = 0; i < report.length - 1; i++) {
                const l1 = report[i], l2 = report[i + 1];
                if (l1 === l2 || Math.abs(l1 - l2) > 3) {
                    return true;
                }

                if (i === 0) {
                    isDec = l2 > l1;
                    isInc = l2 < l1;
                    continue;
                }

                if (isDec && l2 < l1 || isInc && l2 > l1) {
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
                if (!isUnsafe(nReport)) {
                    safeWithDampeningCount++;
                    break;
                }
            }
        })

        console.log("Part 2", safeWithDampeningCount + safeReportCount);
    };
}