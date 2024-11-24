const fs = require("fs");

module.exports = class Reader {
  static _getRawData(path) {
    try {
      return fs.readFileSync(path, "utf8");
    } catch (err) {
      console.error(err);
    }
  }

  static getIntegers(path) {
    return this._getRawData(path)
      .split("\n")
      .map((v) => parseInt(v));
  }

  static getStrings(path) {
    return this._getRawData(path).split("\n");
  }

  static getFloats(path) {
    this._getRawData(path)
      .split("\n")
      .map((v) => parseFloat(v));
  }
};
