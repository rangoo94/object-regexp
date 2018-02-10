const u = require('./utils')

/**
 * Build inline code for "FinishNamedGroup" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @returns {string}
 */
function buildFinishNamedGroupInstructionCode (node) {
  // Build variable names for internals
  const v = {
    startIndex: u.variable(node.parentNode, 'startIndex')
  }

  // Get name for named group
  const name = node.data.name

  if (name === void 0) {
    return ''
  }

  // Close opened group
  return `
    if (ok) {
      groups = groups.set(${JSON.stringify(name)}, ${v.startIndex}, index)
    }
  `
}

module.exports = buildFinishNamedGroupInstructionCode
