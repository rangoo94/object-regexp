const parseExpressionToTokens = require('./parseExpressionToTokens')
const parseTokensToSyntaxTree = require('./parseTokensToSyntaxTree')
const optimizeSyntaxTree = require('./optimizeSyntaxTree')
const applyMacros = require('./applyMacros')

/**
 * Parse serialized expression to node
 *
 * @param {string} expression
 * @param {object[]} [macros]
 * @returns {Node}
 */
function parseExpression (expression, macros) {
  // Apply macros if they are available
  if (macros) {
    expression = applyMacros(expression, macros)
  }

  // Parse tokens to syntax tree
  const tokens = parseExpressionToTokens(expression)
  const root = parseTokensToSyntaxTree(tokens)

  // Optimize syntax tree for processing
  return optimizeSyntaxTree(root)
}

module.exports = parseExpression
