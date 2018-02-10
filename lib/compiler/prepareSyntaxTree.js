const Node = require('../parser/Node')

/**
 * Mark indexes inside nodes
 *
 * @param {Node} rootNode
 */
function markIndexes (rootNode) {
  let index = 0

  rootNode.walk(node => {
    node.index = index++
  })
}

/**
 * Find index for inner nodes in specified node
 *
 * @param {Node} node
 * @returns {int[]}
 */
function findInnerIndexes (node) {
  return node
    .children.map(x => x.index)
    .concat(node.children.reduce((acc, child) => acc.concat(findInnerIndexes(child)), []))
}

/**
 * Mark inner indexes inside nodes
 *
 * @param {Node} rootNode
 */
function markInnerIndexes (rootNode) {
  rootNode.walk(node => {
    node.innerIndexes = findInnerIndexes(node).sort()
  })
}

/**
 * Mark index of next instruction in each node
 *
 * @param {Node} rootNode
 */
function markNextIndexes (rootNode) {
  rootNode.walk(node => {
    node.nextIndex = node.innerIndexes.length
      ? node.innerIndexes[node.innerIndexes.length - 1] + 1
      : node.index + 1
  })
}

/**
 * Add pointer to parent nodes inside each node
 *
 * @param {Node} rootNode
 */
function markParentNodes (rootNode) {
  rootNode.walk((node, parentNode) => {
    node.parentNode = parentNode
  })
}

/**
 * Mark if nodes are last atomic operations
 *
 * @param {Node} rootNode
 */
function markLastAtomicOperations (rootNode) {
  rootNode.walkBackEnd((node, parentNode, index) => {
    // Ignore root node
    if (!parentNode) {
      return
    }

    // It might be last atomic operation
    if (parentNode.type === 'Root' || parentNode.type === 'AtomicGroup' || (parentNode.type === 'Group' && parentNode.isLastAtomic)) {
      const list = parentNode.children

      if (index === list.length - 1) {
        // It is last atomic operation
        node.isLastAtomic = true
      }

      if (index === list.length - 2 && list[index + 1].type === 'FinishNamedGroup') {
        // It is last atomic operation, next is finishing named group only
        node.isLastAtomic = true
      }
    }
  })
}

// Build list of node types which are or might be straight forward
const STRAIGHTFORWARD_OPERATIONS = [ 'Object', 'AnyObject', 'NegatedObject', 'EndIndex', 'Nothing', 'FinishNamedGroup' ]
const OPTIONALLY_STRAIGHTFORWARD = [ 'Optional', 'Alternative', 'ManyLazy', 'AnyGreedy', 'AmountAtMost' ]

/**
 * Mark if node is a straight-forward operation
 *
 * @param {Node} rootNode
 */
function markStraightForwardOperations (rootNode) {
  rootNode.walkBackEnd(node => {
    if (node.isStraightForward) {
      // It's already marked as straight-forward
      return
    }

    if (STRAIGHTFORWARD_OPERATIONS.indexOf(node.type) !== -1) {
      node.isStraightForward = true
      return
    }

    if (OPTIONALLY_STRAIGHTFORWARD.indexOf(node.type) !== -1) {
      node.isStraightForward = node.isLastAtomic
      return
    }

    node.isStraightForward = true

    for (let i = 0; i < node.children.length; i++) {
      if (!node.children[i].isStraightForward) {
        node.isStraightForward = false
        break
      }
    }
  })
}

/**
 * Check if node is simple (says which object should be there)
 *
 * @param {Node} node
 * @returns {boolean}
 */
function isSimpleNode (node) {
  return node.type === 'Nothing' || node.type === 'Object' || node.type === 'NegatedObject' || node.type === 'AnyObject'
}

/**
 * Find list of object nodes which are inside of specified node
 *
 * @param {Node} node
 * @returns {Node[]}
 * @private
 */
function _findFirstObjectNodes (node) {
  // Just return simple nodes
  if (isSimpleNode(node)) {
    return [ node ]
  }

  // Detect both options in alternative
  if (node.type === 'Alternative') {
    return _findFirstObjectNodes(node.children[0]).concat(_findFirstObjectNodes(node.children[1]))
  }

  // Find all possible routes
  const possibilities = []

  if (node.children.length) {
    let i = 0

    // Handle Optional (it might be next one then)
    // Also, ignore "Nothing" rules
    while (i < node.children.length && node.children[i].type === 'Optional') {
      possibilities.push(..._findFirstObjectNodes(node.children[i]))

      i++
    }

    // Handle next option
    if (i < node.children.length) {
      possibilities.push(..._findFirstObjectNodes(node.children[i]))
    }
  }

  return possibilities
}

/**
 * Find map of object nodes which are inside of specified node
 * TODO: Handle values properly
 *
 * @param {Node} node
 * @returns {{ oneOf: Node[], notOneOf: Array<Node[]>, any: boolean, nothing: boolean }}
 */
function findFirstObjectNodes (node) {
  const result = {
    oneOf: [],
    notOneOf: [],
    any: false,
    nothing: false
  }

  if (!node) {
    return result
  }

  const possibilities = _findFirstObjectNodes(node)

  for (let i = 0; i < possibilities.length; i++) {
    if (possibilities[i].type === 'AnyObject') {
      result.any = true
    }

    if (possibilities[i].type === 'Nothing') {
      result.nothing = true
    }

    if (possibilities[i].type === 'Object') {
      result.oneOf.push(...possibilities[i].data.options.map(x => x.type))
    }

    if (possibilities[i].type === 'NegatedObject') {
      result.notOneOf.push(possibilities[i].data.options.map(x => x.type))
    }
  }

  return result
}

/**
 * Find next instruction which can use next object
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {int} index
 * @returns {null|Node}
 */
function findNextInstruction (node, parentNode, index) {
  while (parentNode) {
    // Go down from alternative
    while (parentNode && parentNode.type === 'Alternative') {
      node = parentNode
      parentNode = node.parentNode

      if (parentNode) {
        index = parentNode.children.indexOf(node)
      }
    }

    // Get next operation
    let operation = parentNode.children[index + 1]

    let i = 2

    // Iterate operations until end of current parentNode,
    // or until operation which is not FinishNamedGroup is found
    while (operation) {
      if (operation.type !== 'FinishNamedGroup') {
        return operation
      }

      operation = parentNode.children[index + i]
      i++
    }

    if (!operation) {
      node = parentNode
      parentNode = node.parentNode

      if (parentNode) {
        index = parentNode.children.indexOf(node)
      }
    }
  }

  return null
}

/**
 * Mark possessive instructions as straight-forward,
 * and optimize possessive ManyLazy instruction
 * TODO: Instead of searching for next instruction, search through all possible branches
 * TODO: Handle 'Nothing's properly
 * TODO: Handle values properly
 *
 * @param {Node} rootNode
 */
function markPossessiveInstructions (rootNode) {
  rootNode.walk((node, parentNode, index) => {
    if (node.isStraightForward) {
      // It is already possessive
      return
    }

    if (node.type !== 'ManyLazy' && node.type !== 'AnyGreedy' && node.type !== 'Optional' && node.type !== 'AmountAtMost') {
      // We can't convert it to possessive
      return
    }

    if (!parentNode || (parentNode.type !== 'Group' && parentNode.type !== 'AtomicGroup' && parentNode.type !== 'Root')) {
      // We can detect possessive instructions only in groups & Root nodes
      return
    }

    // Find next operational node
    const nextNode = findNextInstruction(node, parentNode, index)

    // Find next object information
    const firstOwnNodes = findFirstObjectNodes(node)
    const firstNextNodes = findFirstObjectNodes(nextNode)

    // Ignore 'Nothing's and 'AnyObject's for now
    if (firstOwnNodes.any || firstNextNodes.any || firstOwnNodes.nothing || firstNextNodes.nothing) {
      return
    }

    // Ignore 'NegatedObject's for now
    if (firstOwnNodes.notOneOf.length || firstNextNodes.notOneOf.length) {
      return
    }

    // Detect by oneOf
    for (let i = 0; i < firstOwnNodes.oneOf.length; i++) {
      if (firstNextNodes.oneOf.indexOf(firstOwnNodes.oneOf[i]) !== -1) {
        return
      }
    }

    // Convert to ManyGreedy node
    if (node.type === 'ManyLazy' && nextNode) {
      const optimizedNode = [
        ...node.children,
        new Node('AnyGreedy', node.children.map(x => x.clone()))
      ]

      if (parentNode.type === 'Group' || parentNode.type === 'AtomicGroup' || parentNode.type === 'Root') {
        parentNode.children.splice(index, 1, ...optimizedNode)
      } else {
        parentNode.children.splice(index, 1, new Node('Group', [ optimizedNode ]))
      }

      return
    }

    node.isStraightForward = true
  })
}

/**
 * Add nodes for closing named group
 *
 * @param {Node} rootNode
 */
function addNodesForClosingNamedGroup (rootNode) {
  rootNode.walk(node => {
    if (node.type !== 'Group' || node.data.name === void 0) {
      return
    }

    const closingNode = new Node('FinishNamedGroup', null, {
      name: node.data.name
    })

    node.children.push(closingNode)
  })
}

/**
 * Prepare syntax tree to have all markers required to compile instruction
 *
 * @param {Node} rootNode
 * @returns {Node}
 */
function prepareSyntaxTree (rootNode) {
  markParentNodes(rootNode) // required to find next instructions
  addNodesForClosingNamedGroup(rootNode)
  markPossessiveInstructions(rootNode)
  markIndexes(rootNode)
  markInnerIndexes(rootNode)
  markNextIndexes(rootNode)
  markParentNodes(rootNode) // to mark parent nodes in newly created nodes
  markLastAtomicOperations(rootNode)
  markStraightForwardOperations(rootNode)

  return rootNode
}

module.exports = prepareSyntaxTree
