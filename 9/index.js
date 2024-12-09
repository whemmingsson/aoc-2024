
const Parser = require("../common/parser.js");
module.exports = class Day {
    static run() {
        const diskMap = Parser.readRaw(__dirname, false)
            .trim()
            .split("")
            .map((v) => parseInt(v));

        // Remap diskMap
        let fileId = 0;
        const remappedDiskMap = [];
        diskMap.forEach((v, i) => {
            const isFileBlock = i % 2 === 0;
            for (let j = 0; j < v; j++) {
                remappedDiskMap.push(isFileBlock ? fileId.toString() : ".");
            }
            if (isFileBlock) {
                fileId++;
            }
        })

        const getAvailableSpaceRange = (startIndex) => {
            const s = remappedDiskMap.indexOf(".", startIndex);
            let i = s;
            for (i; i < remappedDiskMap.length; i++) {
                if (remappedDiskMap[i] !== ".") {
                    break;
                }
            }
            return { from: s, to: i - 1, length: i - s };
        };

        const checkSum = () => remappedDiskMap.map((v, i) => v === "." ? 0 : parseInt(v) * i).reduce((a, c) => a + c, 0);

        const getFile = (fileId, index) => {
            let fileFrom = remappedDiskMap.indexOf(fileId);
            return { from: fileFrom, to: index, length: index - fileFrom + 1, id: fileId };
        }

        const getFirstAvailableSpace = (minLength) => {
            let space = getAvailableSpaceRange(0);
            while (space.length < minLength) {
                space = getAvailableSpaceRange(space.to + 1);
            }
            return space;
        }

        const moveWholeFile = (file, space) => {
            for (let j = 0; j < file.length; j++) {
                remappedDiskMap[file.from + j] = ".";
                remappedDiskMap[space.from + j] = file.id;
            }
        }

        const didCheck = {};
        for (let i = remappedDiskMap.length - 1; i >= 0; i--) {
            const fileId = remappedDiskMap[i];

            if (fileId === "." || didCheck[fileId]) {
                continue;
            }

            const file = getFile(fileId, i);
            const space = getFirstAvailableSpace(file.length);

            if (space.from < file.from) {
                moveWholeFile(file, space);
            }

            didCheck[fileId] = true;
        }

        console.log(checkSum());
    }
}
