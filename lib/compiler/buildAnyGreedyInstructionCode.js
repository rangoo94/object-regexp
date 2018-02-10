const u = require('./utils')

/**
 * Build inline code for "AnyGreedy" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildAnyGreedyInstructionCode (node, build) {
  // Find instruction for "AnyGreedy"
  const instruction = node.children[0]

  // Build variable names for internals
  const v = {
    fallback: u.variable(node, 'fallback'),
    startIndex: u.variable(node, 'startIndex')
  }

  // Build code for fallback
  const fallback = node.isStraightForward
    ? { create: '', ignore: '' }
    : u.buildFallback(v.fallback, node.nextIndex)

  // Build code to loop with instruction
  return `
    if (step === ${node.index}) {
      step = ${instruction.index}
    }

    while (true) {
      var ${v.startIndex} = index

      ok = true

      ${fallback.create}

      ${build(instruction)}

      if (!ok) {
        ok = true
        index = ${v.startIndex}

        ${fallback.ignore}

        break
      }

      step = ${instruction.index}
    }
  `
}

module.exports = buildAnyGreedyInstructionCode
