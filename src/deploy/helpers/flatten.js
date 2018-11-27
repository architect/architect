// flatten a shallow nested array one level
module.exports = function _flatten(arr) {
  return arr.reduce((acc, e) => acc.concat(e), [])
}
