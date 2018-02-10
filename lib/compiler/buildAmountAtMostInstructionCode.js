const u = require('./utils')

/**
 * Build inline code for "AmountAtMost" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildAmountAtMostInstructionCode (node, build) {
  // Find instruction for "AmountAtMost"
  const instruction = node.children[0]

  // Build variable names for internals
  const v = {
    fallback: u.variable(node, 'fallback'),
    startIndex: u.variable(node, 'startIndex'),
    index: u.variable(node, 'i')
  }

  // Build code for fallback
  const fallback = node.isStraightForward
    ? { create: '', ignore: '' }
    : u.buildFallback(v.fallback, node.nextIndex)

  // Check instruction N times
  return `
    if (step === ${node.index}) {
      step = ${instruction.index}
    }

    ok = true

    for (var ${v.index} = 0; ${v.index} < ${node.data.value}; ${v.index}++) {
      var ${v.startIndex} = index

      ${fallback.create}

      ${build(instruction)}

      if (!ok) {
        ${fallback.ignore}
        index = ${v.startIndex}
        ok = true
        break
      }

      step = ${instruction.index}
    }

    step = ${node.nextIndex}
  `
}

module.exports = buildAmountAtMostInstructionCode
