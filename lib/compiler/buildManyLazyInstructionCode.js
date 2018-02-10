const u = require('./utils')

/**
 * Build inline code for "ManyLazy" instruction
 *
 * @param {Node|{ isPossessive: boolean, isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildManyLazyInstructionCode (node, build) {
  // Get "ManyLazy" instruction
  const instruction = node.children[0]

  // Get code for saving fallback if required
  const saveFallback = node.isStraightForward ? '' : u.createFallback(node.index)

  // Build code
  return `
    if (step === ${node.index}) {
      step = ${instruction.index}
    }
    
    ${build(instruction)}
    
    if (ok) {
      ${saveFallback}
      step = ${node.nextIndex}
    }
  `
}

module.exports = buildManyLazyInstructionCode
