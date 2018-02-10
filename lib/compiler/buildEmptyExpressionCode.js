/**
 * Build inline code for empty expression (without instructions)
 *
 * @returns {string}
 */
function buildEmptyExpressionCode () {
  return `(function () {
    return function matchExpression (objects, startIndex) {
      return {
        finished: true,
        index: startIndex || 0,
        length: 0,
        expectations: null,
        groups: {}
      }
    }
  })()`
}

module.exports = buildEmptyExpressionCode
