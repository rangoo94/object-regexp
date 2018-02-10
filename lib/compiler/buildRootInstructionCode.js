const u = require('./utils')

/**
 * Build inline code for "Root" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildRootInstructionCode (node, build) {
  // Build switcher for instructions
  const cases = u.buildCasesCode(node.children, build)

  return `
    switch (step) {
      case ${node.index}: step = ${node.index + 1}
      ${cases}
    }
  `
}

module.exports = buildRootInstructionCode
