const buildInstruction = require('./buildInstruction')
const processInstruction = require('./processInstruction')
const buildGroupsClass = require('./buildGroupsClass')

/**
 * Compile syntax tree to matching function
 *
 * @param {Node} rootNode
 * @param {boolean} [optimized]  defaults: true
 * @returns {function(object[]): {expectations?: Object[], index?: number, length?: number, groups?: Object}}
 */
function compileSyntaxTree (rootNode, optimized = true) {
  // Build root instruction based on syntax tree
  const instruction = buildInstruction(rootNode, optimized)

  // Build group class based on named groups in syntax tree
  const GroupsClass = buildGroupsClass(rootNode)

  return objects => {
    // Build empty initial groups
    const groups = new GroupsClass({})

    // Process instruction
    return processInstruction(instruction, groups, objects)
  }
}

module.exports = compileSyntaxTree
