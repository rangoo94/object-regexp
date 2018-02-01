const Node = require('./Node')
const parseTokenName = require('./parseTokenName')
const unique = require('../unique')

/**
 * Find right side nodes for 'Alternative' nodes
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} [index]
 */
function findRightSideForAlternatives (node, parentNode, index) {
  // Ignore nodes which are not alternatives
  if (node.type !== 'Alternative') {
    return
  }

  // Validate if right-side node exists
  if (parentNode.children.length === index + 1) {
    node.children.push(new Node('Nothing'))
    return
  }

  // Get and remove right-side nodes from parent
  const children = parentNode.children.splice(index + 1, parentNode.children.length - index - 1)

  // Build Group if required
  const innerNode = children.length === 1 ? children[0] : new Node('Group', children)

  // Set right-side node for Alternative and save as its children
  node.children.push(innerNode)
}

/**
 * Optimize alternatives [Object]|[Object2] to [Object|Object2]
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function optimizeObjectAlternatives (node, parentNode, index) {
  // Ignore nodes which are not alternatives
  if (node.type !== 'Alternative') {
    return
  }

  // Ignore alternatives which has not only objects
  if (node.children[0].type !== 'Object' || node.children[1].type !== 'Object') {
    return
  }

  // Build combined Object node
  const optimizedNode = new Node('Object', null, {
    options: node.children[0].data.options.concat(node.children[1].data.options)
  })

  // Replace Alternative with optimized node
  parentNode.children.splice(index, 1, optimizedNode)
}

/**
 * Remove redundant groups and Nothing nodes from tree
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function removeRedundantNodes (node, parentNode, index) {
  // Handle Nothing nodes
  if (node.type === 'Nothing') {
    // Remove Nothing node from Group & Root elements
    if (parentNode.type === 'Group' || parentNode.type === 'Root' || parentNode.type === 'AtomicGroup') {
      parentNode.children.splice(index, 1)
    }

    return
  }

  // Ignore nodes which are not groups and doesn't have name
  if (node.type !== 'Group' || node.data.name) {
    return
  }

  // Replace empty groups with Nothing
  if (node.children.length === 0) {
    if (parentNode.type !== 'Group' && parentNode.type !== 'Root' && parentNode.type !== 'AtomicGroup') {
      parentNode.children.splice(index, 1, new Node('Nothing'))
    } else {
      parentNode.children.splice(index, 1)
    }

    return
  }

  // Allow unpacking only single nodes,
  // Or into Root & Group nodes
  if (node.children.length > 1 && parentNode.type !== 'Group' && parentNode.type !== 'Root' && parentNode.type !== 'AtomicGroup') {
    return
  }

  // Replace group with inner children
  Array.prototype.splice.apply(
    parentNode.children,
    [ index, 1 ].concat(node.children)
  )
}

/**
 * Convert ManyLazy instruction ([x]+?) to faster way ([x][x]*?)
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function simplifyAnyLazyInstruction (node, parentNode, index) {
  // Ignore nodes which are not AnyLazy
  if (node.type !== 'AnyLazy') {
    return
  }

  // Optimize ManyLazy instruction
  const optimizedNode = new Node('Alternative', [
    new Node('Nothing'),
    new Node('ManyLazy', node.children)
  ])

  // Replace AnyLazy instruction
  parentNode.children.splice(index, 1, optimizedNode)
}

/**
 * Convert ManyGreedy instruction ([X]+) to faster way ([X][X]*)
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function simplifyManyGreedyInstruction (node, parentNode, index) {
  // Ignore nodes which are not ManyGreedy
  if (node.type !== 'ManyGreedy') {
    return
  }

  // Optimize ManyGreedy (it can have only single children)
  const optimizedNode = new Node('Group', [
    node.children[0],
    new Node('AnyGreedy', [ node.children[0].clone() ])
  ])

  // Replace ManyGreedy instruction
  parentNode.children.splice(index, 1, optimizedNode)
}

const POSSESSIVE_INSTRUCTIONS = {
  ManyPossessive: 'ManyGreedy',
  AnyPossessive: 'AnyGreedy',
  OptionalPossessive: 'Optional',
  AmountAtLeastPossessive: 'AmountAtLeast',
  AmountBetweenPossessive: 'AmountBetween',
  AmountAtMostPossessive: 'AmountAtMost'
}

/**
 * Convert (Many|Any|Amount*|Optional)Possessive instructions, i.e. ([X]++) to faster way -> (?>[X]+)
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function simplifyPossessiveInstructions (node, parentNode, index) {
  const endType = POSSESSIVE_INSTRUCTIONS[node.type]

  // Ignore nodes which are not possessive
  if (!endType) {
    return
  }

  // Optimize possessive (it can have only single children)
  const optimizedNode = new Node('AtomicGroup', [
    new Node(endType, [ node.children[0] ])
  ])

  // Replace possessive instruction
  parentNode.children.splice(index, 1, optimizedNode)
}

/**
 * Convert AmountAtLeast instruction ([X]{a,}) to faster way ([X]{a}[X]*)
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function simplifyAmountAtLeastInstruction (node, parentNode, index) {
  // Ignore nodes which are not AmountAtLeast
  if (node.type !== 'AmountAtLeast') {
    return
  }

  // Optimize AmountLeast instruction
  const optimizedNode = new Node('Group', [
    new Node('AmountExact', node.children, { value: node.data.value }),
    new Node('AnyGreedy', node.children.map(x => x.clone()))
  ])

  // Replace AmountAtLeast instruction
  parentNode.children.splice(index, 1, optimizedNode)
}

/**
 * Unpack AmountExact instruction ([X]{3}) to faster way ([X][X][X])
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function simplifyAmountExactInstruction (node, parentNode, index) {
  // Ignore nodes which are not AmountExact
  if (node.type !== 'AmountExact') {
    return
  }

  // Remove AmountExact if it should be repeated 0 times
  // eslint-disable-next-line
  if (node.data.value == 0) {
    parentNode.children.splice(index, 1, new Node('Nothing'))
    return
  }

  const children = []

  // Copy children as many times as it's required
  for (let i = 0; i < node.data.value; i++) {
    Array.prototype.push.apply(children, node.children.map(x => x.clone()))
  }

  // Generate optimized node
  const optimizedNode = new Node('Group', children)

  // Replace AmountExact node
  parentNode.children.splice(index, 1, optimizedNode)
}

/**
 * Convert AmountBetween instruction ([X]{3,5}) to faster way ([X][X][X][X]{,2})
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function simplifyAmountBetweenInstruction (node, parentNode, index) {
  // Ignore nodes which are not AmountBetween
  if (node.type !== 'AmountBetween') {
    return
  }

  // Build optimized node for amount between
  const optimizedNode = new Node('Group', [
    new Node('AmountExact', node.children.map(x => x.clone()), { value: node.data.from }),
    new Node('AmountAtMost', node.children.map(x => x.clone()), { value: node.data.to - node.data.from })
  ])

  // Replace AmountBetween instruction
  parentNode.children.splice(index, 1, optimizedNode)
}

/**
 * Remove object redundancy (i.e. convert [A|A] to [A])
 *
 * @param {Node} node
 */
function removeObjectRedundancy (node) {
  // Ignore nodes which are not objects
  if (node.type !== 'Object') {
    return
  }

  // Remove redundant options
  node.data.options = node.data.options.map(x => x.type + (x.value ? '=' + x.value : ''))
  node.data.options = unique(node.data.options).map(parseTokenName)
}

/**
 * Convert AmountAtMost instruction ([X]{,3}) to faster way ([X]?[X]?[X]?)
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function simplifyAmountAtMostInstruction (node, parentNode, index) {
  // Ignore nodes which are not AmountAtMost
  if (node.type !== 'AmountAtMost') {
    return
  }

  // Build optimized node for amount between
  const optimizedNode = new Node('Group', [])

  for (let i = 0; i < node.data.value; i++) {
    optimizedNode.children.push(
      new Node('Optional', node.children.map(x => x.clone()))
    )
  }

  // Replace AmountAtMost instruction
  parentNode.children.splice(index, 1, optimizedNode)
}

/**
 * Remove redundant Nothing nodes in Root and Group nodes
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 */
function removeRedundantNothings (node, parentNode, index) {
  // Ignore nodes which are not Nothing
  if (node.type !== 'Nothing') {
    return
  }

  // Ignore Nothing nodes which are not in Root or Group nodes
  if (parentNode.type !== 'Group' && parentNode.type !== 'Root' && parentNode.type !== 'AtomicGroup') {
    return
  }

  // Remove redundant Nothing nodes in Root and Group nodes
  parentNode.children.splice(index, 1)
}

exports.findRightSideForAlternatives = findRightSideForAlternatives
exports.optimizeObjectAlternatives = optimizeObjectAlternatives
exports.removeRedundantNodes = removeRedundantNodes
exports.simplifyAnyLazyInstruction = simplifyAnyLazyInstruction
exports.simplifyManyGreedyInstruction = simplifyManyGreedyInstruction
exports.simplifyPossessiveInstructions = simplifyPossessiveInstructions
exports.simplifyAmountAtLeastInstruction = simplifyAmountAtLeastInstruction
exports.simplifyAmountExactInstruction = simplifyAmountExactInstruction
exports.simplifyAmountBetweenInstruction = simplifyAmountBetweenInstruction
exports.removeObjectRedundancy = removeObjectRedundancy
exports.removeRedundantNothings = removeRedundantNothings
exports.simplifyAmountAtMostInstruction = simplifyAmountAtMostInstruction
