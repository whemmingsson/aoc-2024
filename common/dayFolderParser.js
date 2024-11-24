module.exports = getDay = (dir) => {
  const dirParts = dir.split("/");
  return dirParts[dirParts.length - 1];
};
