const TOKEN_NAME_REGEX = /^([^=]+)(=(.*)+)?$/

/**
 * Parse extended token name to get it's name and value
 *
 * @param {string} tokenName
 * @returns {{ type: string, [value]: string }}
 */
function parseTokenName (tokenName) {
  const token = tokenName.match(TOKEN_NAME_REGEX)

  if (!token) {
    throw new Error('Incorrect token type: ' + tokenName)
  }

  if (token[2] === undefined) {
    return {
      type: tokenName
    }
  }

  return {
    type: token[1],
    value: token[3].replace(/\\(.)/, '$1')
  }
}

module.exports = parseTokenName
