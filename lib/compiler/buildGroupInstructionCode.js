const u = require('./utils')

/**
 * Build inline code for "Group" instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @param {function(Node)} build
 * @returns {string}
 */
function buildGroupInstructionCode (node, build) {
  // Build variable names for internals
  const v = {
    startIndex: u.variable(node, 'startIndex')
  }

  // Get name for named group
  const name = node.data.name

  // Build code for opening and closing group if required
  const openGroup = name === void 0 ? '' : `var ${v.startIndex} = index`

  // Build simple code if there is single instruction in group
  // It shouldn't actually happen, as it means empty named group or group with single element
  if (node.children.length === 1) {
    return `
      if (step === ${node.index}) {
        ${openGroup}
        step = ${node.children[0].index}
      }

      ${build(node.children[0])}
    `
  }

  // Build simple code if there is single instruction in group,
  // with FinishNamedGroup as well
  if (node.children.length === 2 && node.children[node.children.length - 1].type === 'FinishNamedGroup') {
    return `
      if (step === ${node.index}) {
        ${openGroup}
        step = ${node.children[0].index}
      }

      ${build(node.children[0])}

      ${build(node.children[1])}
    `
  }

  // Build switcher for multiple instructions
  const cases = node.children.map(x => `
    ${u.cases(x)} ${build(x)}

    if (!ok) {
      break
    }
  `)

  return `
    switch (step) {
      case ${node.index}:
        step = ${node.children[0].index}
        ${openGroup}
      ${cases.join('')}
    }
  `
}

module.exports = buildGroupInstructionCode
