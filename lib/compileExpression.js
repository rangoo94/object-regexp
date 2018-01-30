const parseExpressionToSyntaxTree = require('./parser/parseExpressionToSyntaxTree')
const compileSyntaxTree = require('./compileSyntaxTree')

/**
 * Compile serialized (string) expression to its matcher function.
 *
 * @param {string} expression
 * @param {object[]} [macros]
 * @param {boolean} [optimized]  defaults: true
 * @returns {function(Object[]): {expectations?: Object[], index?: number, length?: number, groups?: Object}}
 */
function compileExpression (expression, macros, optimized = true) {
  const rootNode = parseExpressionToSyntaxTree(expression, macros)

  return compileSyntaxTree(rootNode, optimized)
}

module.exports = compileExpression
