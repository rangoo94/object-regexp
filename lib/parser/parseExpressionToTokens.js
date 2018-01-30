const lexer = require('./lexer')

/**
 * Parse expression into list of tokens
 *
 * @param {string} expression
 * @returns {Token[]}
 */
function parseExpressionToTokens (expression) {
  return lexer.for(expression).process()
}

module.exports = parseExpressionToTokens
