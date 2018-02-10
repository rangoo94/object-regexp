const u = require('./utils')

/**
 * Build inline code for "AmountExact" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildAmountExactInstructionCode (node, build) {
  // Find instruction for "AmountExact"
  const instruction = node.children[0]

  // Build variable name for loop index
  const index = u.variable(node, 'i')

  // Check instruction N times
  return `
    if (step === ${node.index}) {
      step = ${instruction.index}
    }

    ok = true

    for (var ${index} = 0; ${index} < ${node.data.value}; ${index}++) {
      ${build(instruction)}

      if (!ok) {
        break
      }

      step = ${instruction.index}
    }
  `
}

module.exports = buildAmountExactInstructionCode
