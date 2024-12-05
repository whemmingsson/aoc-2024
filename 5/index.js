const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {

        const rules = []
        const updates = [];
        Parser.readRaw(__dirname, false).split("\n").forEach(line => {
            if (line.indexOf("|") >= 0) {
                const rSplit = line.trimEnd().split("|");
                rules.push({ L: parseInt(rSplit[0]), R: parseInt(rSplit[1]) })
            }
            else if (line.indexOf(",") >= 0) {
                updates.push([...line.trimEnd().split(",").map(v => parseInt(v))]);
            }
        });

        // index rules:
        const rulesIndexed = {};
        rules.forEach(r => {
            const { L, R } = r;
            if (!rulesIndexed[L]) {
                rulesIndexed[L] = [];
            }
            if (!rulesIndexed[R]) {
                rulesIndexed[R] = [];
            }

            rulesIndexed[R].push(r);
            rulesIndexed[L].push(r);
        })

        const otherPage = (r, p) => {
            if (r.L === p) return r.R;
            return r.L;
        }

        const validate = (u) => {
            let valid = true;
            for (let i = 0; i < u.length; i++) {

                const page = u[i];
                const rules = rulesIndexed[page];
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    const other = otherPage(rule, page);
                    if (u.indexOf(other) < 0) {
                        // Did not find other page in update set, skip
                        continue;
                    }

                    const indexOfPage = u.indexOf(page);
                    const indexOfOther = u.indexOf(other);

                    // If page is to the left, other must be to to the right. 
                    if (rule.L === page && indexOfOther < indexOfPage) {

                        valid = false;
                        break;
                    }

                    // If page is to the right, other must be to to the left. 
                    if (rule.R === page && indexOfOther > indexOfPage) {
                        valid = false;
                        break;
                    }

                }

                if (!valid) {
                    break;
                }
            }

            if (valid) {
                return true;
            }
            else {
                return false;
            }
        }



        const reorder = (u) => {
            const old = [...u];
            const swap = (a, b) => {
                let t = u[a];
                u[a] = u[b];
                u[b] = t;
            }

            for (let i = 0; i < u.length; i++) {
                const page = u[i];
                const rules = rulesIndexed[page];
                for (let j = 0; j < (rules ?? []).length; j++) {
                    const rule = rules[j];
                    const other = otherPage(rule, page);
                    if (u.indexOf(other) < 0) {
                        // Did not find other page in update set, skip
                        continue;
                    }

                    const indexOfPage = u.indexOf(page);
                    const indexOfOther = u.indexOf(other);

                    // If page is to the left, other must be to to the right. 
                    if (rule.L === page && indexOfOther < indexOfPage) {
                        swap(indexOfPage, indexOfOther);
                        break;
                    }

                    // If page is to the right, other must be to to the left. 
                    if (rule.R === page && indexOfOther > indexOfPage) {
                        swap(indexOfPage, indexOfOther);
                        break;
                    }
                }
            }

            console.log("")
            console.log("Original update:", old);
            console.log("Reordered update:", u);
            console.log("")
            return u;
        }

        let middleSum = 0;
        const invalidUpdates = [];
        updates.forEach(update => {
            if (validate(update)) {
                middleSum += update[Math.ceil(update.length / 2) - 1];
            }
            else {
                invalidUpdates.push(update);
            }
        })

        console.log("Part 1", middleSum);

        middleSum = 0;
        invalidUpdates.forEach(update => {
            let reOrderedUpdate = reorder(update);
            while (!validate(reOrderedUpdate)) {
                reOrderedUpdate = reorder(reOrderedUpdate);
            }
            middleSum += reOrderedUpdate[Math.ceil(reOrderedUpdate.length / 2) - 1];
        });

        console.log("Part 2", middleSum);
    };
}