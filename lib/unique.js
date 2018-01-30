/**
 * Find unique values in array
 *
 * @param {Array} arr
 * @returns {Array}
 */
function unique (arr) {
  return arr.filter((x, i) => arr.indexOf(x) === i)
}

module.exports = unique
