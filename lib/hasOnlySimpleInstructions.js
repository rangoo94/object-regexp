const SIMPLE_INSTRUCTIONS = {
  NegatedObject: true,
  AnyObject: true,
  Group: true,
  Object: true,
  Root: true
}

/**
 * Check if there are only simple instructions in syntax tree
 *
 * @param {Node} rootNode
 * @returns {boolean}
 */
function hasOnlySimpleInstructions (rootNode) {
  let isSimple = true

  rootNode.walk(node => {
    if (!SIMPLE_INSTRUCTIONS[node.type]) {
      isSimple = false
    }
  })

  return isSimple
}

module.exports = hasOnlySimpleInstructions
