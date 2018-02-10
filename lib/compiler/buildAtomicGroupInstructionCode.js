const u = require('./utils')

/**
 * Build inline code for "AtomicGroup" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildAtomicGroupInstructionCode (node, build) {
  // Build variable names for internals
  const v = {
    fallback: u.variable(node, 'fallback')
  }

  // Build code to save and recover previous fallback
  const saveFallback = node.isStraightForward ? '' : `var ${v.fallback} = fallback`
  const recoverFallback = node.isStraightForward ? '' : `fallback = ${v.fallback}`

  // Build simple code if there is single instruction in atomic group
  if (node.children.length === 1) {
    return `
      ${saveFallback}
      
      if (step === ${node.index}) {
        step = ${node.children[0].index}
      }

      ${build(node.children[0])}
      
      if (ok) {
        ${recoverFallback}
      }
    `
  }

  // Build switcher for inner instructions
  const cases = u.buildCasesCode(node.children, build)

  return `
      ${saveFallback}

      switch (step) {
        case ${node.index}: step = ${node.children[0].index}
        ${cases}
      }

      if (ok) {
        ${recoverFallback}
      }
    `
}

module.exports = buildAtomicGroupInstructionCode
