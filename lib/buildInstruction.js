const Instruction = require('./Instruction')

// We use integer types for nodes over there,
// as it works much faster when compared.
const TYPES = {
  Root: 0,
  Object: 1,
  Alternative: 2,
  Group: 3,
  AnyGreedy: 4,
  NegatedObject: 5,
  AnyObject: 6,
  Optional: 7,
  ManyLazy: 8,
  Nothing: 9,
  AtomicGroup: 10
}

/**
 * Build code needed to build single instruction
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 * @returns {string}
 */
function buildInstructionCode (node, parentNode, index) {
  // Find integer representation of node type
  const type = TYPES[node.type]

  // Throw error when we do not understand this node
  if (type === void 0) {
    throw new Error('Unknown node: ' + node.type)
  }

  // Find next sibling, to make parent know where to go after
  const nextSibling = parentNode && parentNode.children[index + 1]
  const nextSiblingIndex = nextSibling ? nextSibling.index : 'null'

  // Find parent node index
  const parentIndex = parentNode ? parentNode.index : 'null'

  // Find instruction data
  const data = JSON.stringify(node.data || {})

  // Find indexes of all sub-instructions
  const children = JSON.stringify(node.children.map(x => x.index))

  // Build a code for instruction
  return `new Instruction(${nextSiblingIndex},${type},${parentIndex},${data},${children})`
}

/**
 * Build Instruction instance from Node
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 * @returns {Instruction}
 */
function buildInstructionInstance (node, parentNode, index) {
  // Find integer representation of node type
  const type = TYPES[node.type]

  // Throw error when we do not understand this node
  if (type === void 0) {
    throw new Error('Unknown node: ' + node.type)
  }

  // Find next sibling, to make parent know where to go after
  const nextSibling = parentNode && parentNode.children[index + 1]
  const nextSiblingIndex = nextSibling ? nextSibling.index : null

  // Find parent node index
  const parentIndex = parentNode ? parentNode.index : null

  // Find instruction data
  const data = node.data || {}

  // Find indexes of all sub-instructions
  const children = node.children.map(x => x.index)

  // Build a code for instruction
  return new Instruction(nextSiblingIndex, type, parentIndex, data, children)
}

/**
 * Build optimized list of instructions.
 *
 * Performance note:
 * It works later MUCH faster if we create it this way,
 * as engine can optimize these fully.
 *
 * Anyway, parsing expression may be slower
 *
 * @param {Node} rootNode
 * @returns {Instruction[]}
 */
function buildOptimizedInstructionsList (rootNode) {
  let instructions = []

  // Walk through whole syntax tree, and create instruction for each node
  rootNode.walk((node, parentNode, index) => {
    instructions.push(buildInstructionCode(node, parentNode, index))
  })

  // Create and immediately fire factory of instructions list
  // eslint-disable-next-line
  return new Function('Instruction', `return [${instructions.join(',')}]`)(Instruction)
}

/**
 * Build simple list of instructions
 *
 * @param {Node} rootNode
 * @returns {Instruction[]}
 */
function buildInstructionsList (rootNode) {
  let instructions = []

  rootNode.walk((node, parentNode, index) => {
    instructions.push(buildInstructionInstance(node, parentNode, index))
  })

  return instructions
}

/**
 * Mark node indexes in syntax tree
 *
 * @param {Node} rootNode
 */
function markNodeIndexes (rootNode) {
  let i = 0
  rootNode.walk(node => {
    node.index = i
    i++
  })
}

/**
 * Build root instruction object.
 *
 * Performance note:
 * When we create a factory which builds a code for instructions,
 * These instructions works MUCH faster, as engine can optimize them fully.
 *
 * @param {Node} rootNode
 * @param {boolean} [optimized]  defaults: true
 * @returns {Instruction}
 */
function buildInstruction (rootNode, optimized = true) {
  // Add 'index' to all nodes inside - required for mapping it later
  markNodeIndexes(rootNode)

  // Build optimized list of instructions
  const instructions = optimized ? buildOptimizedInstructionsList(rootNode) : buildInstructionsList(rootNode)

  // Replace indexes in instructions to pointers to instructions
  for (let a = 0; a < instructions.length; a++) {
    const o = instructions[a]

    // Replace children indexes with instruction pointers
    o.children = o.children.map(x => instructions[x])

    // Replace parent node index with instruction pointer (or self for Root)
    o.parentNode = o.parentNode === null ? o : instructions[o.parentNode]

    // Replace next sibling of sub-instruction with instruction pointer
    o.nextSibling = o.nextSibling === null ? null : instructions[o.nextSibling]

    // Set first child of instruction to instruction pointer
    o.firstChild = o.children.length ? o.children[0] : null
  }

  // Return only root instruction, because it contain full information
  return instructions[0]
}

module.exports = buildInstruction
