const u = require('./utils')

/**
 * Build inline code for "Optional" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildOptionalInstructionCode (node, build) {
  // Get "Optional" instruction
  const instruction = node.children[0]

  // Build variable names for internals
  const v = {
    fallback: u.variable(node, 'fallback'),
    startIndex: u.variable(node, 'startIndex')
  }

  // Build code for creating and ignoring fallback
  const fallback = node.isStraightForward
    ? { create: '', ignore: '' }
    : u.buildFallback(v.fallback, node.nextIndex)

  // Build code for optional instruction
  return `
    var ${v.startIndex} = index

    ${fallback.create}
    
    if (step === ${node.index}) {
      step = ${instruction.index}
    }

    ${build(instruction)}

    if (!ok) {
      ${fallback.ignore}
      index = ${v.startIndex}
    }

    step = ${node.nextIndex}
    ok = true
  `
}

module.exports = buildOptionalInstructionCode
