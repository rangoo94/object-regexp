const getCurrentPosition = require('./getCurrentPosition')

const WHITESPACES_REGEX = /[\n\t\r]/g
const TEXT_LENGTH = 45

/**
 * Sanitize text to have single type of whitespaces
 *
 * @param {string} text
 * @returns {string}
 */
function sanitize (text) {
  return text.replace(WHITESPACES_REGEX, ' ')
}

/**
 * Create syntax error with hints for developers
 *
 * @param {string} error
 * @param {Token[]} [tokens]
 * @param {int} [index]
 * @returns {Error}
 */
function createSyntaxError (error, tokens, index) {
  // Build basic message
  const baseMessage = 'Syntax error: ' + sanitize(error)

  // Return simple error when there is lack of code information
  if (tokens == null || index == null) {
    return new Error(baseMessage)
  }

  // Gather code before and after
  const before = tokens.slice(0, index).reduce((acc, token) => acc + token.code, '')
  const after = tokens.slice(index).reduce((acc, token) => acc + token.code, '')

  // Find position
  const position = getCurrentPosition(before)

  // Cut text
  const textBefore = sanitize(before).substr(-TEXT_LENGTH)
  const textAfter = sanitize(after).substr(0, TEXT_LENGTH)

  // Build whitespace before cursor position
  const whitespace = ' '.repeat(textBefore.length)

  // Build extended message
  const message =
    baseMessage + ' (line: ' + position.line + ', column: ' + position.index + ')\n' +
    textBefore + textAfter + '\n' +
    whitespace + '^'

  // Return error
  return new Error(message)
}

module.exports = createSyntaxError
