const buildCodeFromExpression = require('./compiler/buildCodeFromExpression')
const u = require('./compiler/utils')

/**
 * Build matcher code
 *
 * @param {string} expression
 * @param {object[]} [macros]
 * @param {boolean} [beautify]
 * @returns {string}
 */
function buildMatcherCode (expression, macros, beautify = false) {
  const code = buildCodeFromExpression(expression, macros)

  if (beautify) {
    return u.beautify(code)
  }

  return u.trimSpaces(code)
}

module.exports = buildMatcherCode
