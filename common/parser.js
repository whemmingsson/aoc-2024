const Reader = require("../common/reader.js");
const getDay = require("../common/dayFolderParser.js");
const os = require('node:os');

module.exports = class Parser {
  static parse(dir, useExample, shapes) {
    const result = [];
    console.log(dir);
    Reader._getRawData(Parser._getPath(dir, useExample))
      .split("\n")
      .forEach((line) => {
        console.log("Parsing ", line);
        const parsed = this._parse(shapes, line);
        if (parsed) result.push(parsed);
        else {
          console.log("Could not parse line: ", line);
        }
      });
    return result;
  }

  static readRaw(dir, useExample) {
    return Reader._getRawData(Parser._getPath(dir, useExample));
  }

  static isWindows = () => os.platform() === "win32";

  static _getPath(dir, useExample) {
    return `${this.isWindows() ? "" : "./"}${getDay(dir)}/data${useExample ? "_example" : ""}.txt`;
  }

  static _parse(shapes, line) {
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape.type === "regex") {
        const maybeParsed = this._parseWithRegex(line, shape);
        if (!maybeParsed) continue;
        return maybeParsed;
      }
      if (shape.type === "array") {
        const maybeParsed = this._parseArray(line, shape);
        if (!maybeParsed) continue;
        return maybeParsed;
      }
    }
  }

  static _parseWithRegex(line, shape) {
    const parse = (value) => {
      const maybeFloat = parseFloat(value);
      if (maybeFloat == value) return maybeFloat;
      const maybeInt = parseInt(value);
      if (maybeInt == value) return maybeInt;
      return value;
    };

    const result = new RegExp(shape.regex).exec(line);
    if (result && result.length === shape.props.length + 1) {
      const values = result.splice(1); // Splice off the whole string result
      const obj = {};
      for (let j = 0; j < values.length; j++) {
        obj[shape.props[j]] = parse(values[j]);
      }
      return obj;
    }
    return null;
  }

  static _parseUsingFunc(func, line) {
    return func(line);
  }

  static _parseArray(line, shape) {
    const values = line.split(shape.delimiter);
    let parserFunc = (v) => v;

    if (shape.valueType === "int") parserFunc = parseInt;
    if (shape.valueType == "float") parserFunc = parseFloat;
    if (shape.valueType == "string") parserFunc = (v) => v;

    const maybeResult = values.map((v) => parserFunc(v));
    if ((shape.valueType === "int" || shape.valueType == "float") && maybeResult.every((v) => !isNaN(v))) return maybeResult;
    if (shape.valueType === "string") return maybeResult;

    return null;
  }
};
