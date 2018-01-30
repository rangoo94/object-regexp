/**
 * Match object against some rules
 *
 * @param {object|{ type: string, [data]: { [value]: string|* } }} object
 * @param {Array<{ type: string, [value]: string|* }>} options
 * @returns {boolean}
 */
function isValidObject (object, options) {
  // Often we have only single option, so it's much faster to detect it there
  if (options.length === 1) {
    const option = options[0]

    // == is here faster and more appropriate than ===
    // eslint-disable-next-line
    return object.type === option.type && (option.value === void 0 || object.data.value == option.value)
  }

  // Iterate over all options to find matching one
  for (let i = 0; i < options.length; i++) {
    const option = options[i]

    // == is here faster and more appropriate than ===
    // eslint-disable-next-line
    if (object.type !== option.type || (option.value !== void 0 && object.data.value != option.value)) {
      continue
    }

    return true
  }

  // There wasn't any matching option
  return false
}

module.exports = isValidObject
