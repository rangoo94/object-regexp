const buildInstruction = require('./buildInstruction')
const processInstruction = require('./processInstruction')
const processSimpleInstruction = require('./processSimpleInstruction')
const processEmptyInstruction = require('./processEmptyInstruction')
const hasOnlySimpleInstructions = require('./hasOnlySimpleInstructions')
const buildGroupsClass = require('./buildGroupsClass')

/**
 * Compile syntax tree to matching function
 *
 * @param {Node} rootNode
 * @param {boolean} [optimized]  defaults: true
 * @returns {function(object[]): {expectations?: Object[], index?: number, length?: number, groups?: Object}}
 */
function compileSyntaxTree (rootNode, optimized = true) {
  // Handle empty syntax tree
  if (rootNode.children.length === 0) {
    return processEmptyInstruction
  }

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
