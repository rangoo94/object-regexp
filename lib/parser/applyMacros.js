const buildNamedRegularExpression = require('./buildNamedRegularExpression')

/**
 * Apply macros to object expression
 *
 * @param {string} expression
 * @param {Array<{ from: string, to: string }>} macros
 * @returns {string}
 */
function applyMacros (expression, macros) {
  // Validate macros
  if (!Array.isArray(macros)) {
    throw new Error('You have to pass array of macros.')
  }

  // Validate expression
  if (typeof expression !== 'string') {
    throw new Error('Expression should be a string.')
  }

  // Iterate over macros to apply them
  for (let i = 0; i < macros.length; i++) {
    // Validate macro
    if (!macros[i].from || !macros[i].to) {
      throw new Error('Macro requires `from` and `to` fields.')
    }

    // Parse regular expression
    const regex = buildNamedRegularExpression(macros[i].from, 'g')

    /**
     * Replace occurrence of regular expression
     *
     * @param match
     * @returns {string}
     */
    const replaceOccurrence = function replaceOccurrence (...match) {
      // Apply groups into match
      for (let key in regex.indices) {
        match[key] = match[regex.indices[key]]
      }

      // Replace occurrence
      return macros[i].to.replace(/\$([a-zA-Z0-9]+)/g, ($0, $1) => match[$1])
    }

    // Apply macro to expression
    expression = expression.replace(regex.regex, replaceOccurrence)
  }

  return expression
}

module.exports = applyMacros
