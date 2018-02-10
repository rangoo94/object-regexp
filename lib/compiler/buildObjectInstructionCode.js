const u = require('./utils')

/**
 * Build condition for selected option
 *
 * @param {string} variable
 * @param {{ type: string, [value]: * }} option
 * @returns {string}
 */
function buildOptionCode (variable, option) {
  if (option.value) {
    return `(${variable}.type === ${JSON.stringify(option.type)} && ${variable}.data.value == ${JSON.stringify(option.value)})`
  }

  return `${variable}.type === ${JSON.stringify(option.type)}`
}

/**
 * Build condition to check all options
 *
 * @param {string} variable
 * @param {Array<{ type: string, [value]: * }>} options
 * @returns {string|*}
 */
function buildCondition (variable, options) {
  return options.map(x => buildOptionCode(variable, x)).join(' || ')
}

/**
 * Build inline code for "Object" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @returns {string}
 */
function buildObjectInstructionCode (node) {
  // Build variable names for internals
  const v = {
    object: u.variable(node, 'object')
  }

  // Get options information
  const options = node.data.options

  // Build matching condition
  const condition = options.length === 1
    ? `ok = ${buildCondition('objects[index]', options)}`
    : `var ${v.object} = objects[index]
       ok = ${buildCondition(v.object, options)}`

  // Build full matching code
  return `
    if (index >= objects.length) {
      if (!expectations) {
        expectations = []
      }
      expectations.push(E$${node.index})
      ok = false
    } else {
      ${condition}
      index++
    }
  `
}

module.exports = buildObjectInstructionCode
