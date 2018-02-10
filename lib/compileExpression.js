const buildMatcherCode = require('./buildMatcherCode')

/**
 * Compile expression to matching function
 *
 * @param {string} expression
 * @param {object[]} [macros]
 * @returns {function}
 */
function compileExpression (expression, macros) {
  // eslint-disable-next-line
  return new Function(`return ${buildMatcherCode(expression, macros)}`)()
}

module.exports = compileExpression
