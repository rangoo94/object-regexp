const prepareSyntaxTree = require('./prepareSyntaxTree')
const buildCodeFromSyntaxTree = require('./buildCodeFromSyntaxTree')
const parseExpressionToSyntaxTree = require('../parser/parseExpressionToSyntaxTree')

/**
 * Build inline matching code from string expression
 *
 * @param {string} expression
 * @param {object[]} [macros]
 * @returns {string}
 */
function buildCodeFromExpression (expression, macros) {
  // Parse string expression
  const rootNode = parseExpressionToSyntaxTree(expression, macros)

  // Analyze syntax tree to gather important data
  const preparedNode = prepareSyntaxTree(rootNode)

  // Build code from prepared syntax tree
  return buildCodeFromSyntaxTree(preparedNode)
}

module.exports = buildCodeFromExpression
