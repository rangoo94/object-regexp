const u = require('./utils')

/**
 * Build inline code for "Alternative" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildAlternativeInstructionCode (node, build) {
  // Build variable names for internals
  const v = {
    startIndex: u.variable(node, 'startIndex'),
    groups: u.variable(node, 'groups')
  }

  // Find both sides of alternative
  const left = node.children[0]
  const right = node.children[1]

  // Build code for creating callbacks
  const fallback = node.isStraightForward
    ? ''
    : u.createFallback(right.index, v.startIndex, v.groups)

  // Build switcher for child instructions
  return `
    var ${v.startIndex} = index
    var ${v.groups} = groups

    switch (step) {
      case ${node.index}: step = ${left.index}
      ${u.cases(left)} ${build(left)}

      if (ok) {
        step = ${node.nextIndex}
        ${fallback}
        break
      }

      index = ${v.startIndex}

      ${u.cases(right)} ${build(right)}
    }
  `
}

module.exports = buildAlternativeInstructionCode
