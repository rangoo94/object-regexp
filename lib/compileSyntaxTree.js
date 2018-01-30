const buildInstruction = require('./buildInstruction')
const processInstruction = require('./processInstruction')
const processSimpleInstruction = require('./processSimpleInstruction')
const buildGroupsClass = require('./buildGroupsClass')
const hasOnlySimpleInstructions = require('./hasOnlySimpleInstructions')

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

  // Check if it's simple instruction, to choose processing function
  const process = hasOnlySimpleInstructions(rootNode) ? processSimpleInstruction : processInstruction

  return objects => {
    // Build empty initial groups
    const groups = new GroupsClass({})

    // Process instruction
    return process(instruction, groups, objects)
  }
}

module.exports = compileSyntaxTree
