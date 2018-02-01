const Node = require('./Node')
const convertTokenToNode = require('./convertTokenToNode')
const createSyntaxError = require('./createSyntaxError')
const optimizations = require('./optimizations')

const OBJECT_TOKENS = [ 'Object', 'NegatedObject', 'AnyObject' ]
const INDEXES = [ 'EndIndex' ]
const QUANTIFIER_READY = [ 'Group' ].concat(OBJECT_TOKENS)
const QUANTIFIERS = {
  ManyGreedyQuantifier: 'ManyGreedy',
  ManyPossessiveQuantifier: 'ManyPossessive',
  ManyLazyQuantifier: 'ManyLazy',
  AnyGreedyQuantifier: 'AnyGreedy',
  AnyPossessiveQuantifier: 'AnyPossessive',
  AnyLazyQuantifier: 'AnyLazy',
  OptionalPossessiveQuantifier: 'OptionalPossessive',
  OptionalQuantifier: 'Optional',
  AmountExactQuantifier: 'AmountExact',
  AmountBetweenPossessiveQuantifier: 'AmountBetweenPossessive',
  AmountBetweenQuantifier: 'AmountBetween',
  AmountAtLeastPossessiveQuantifier: 'AmountAtLeastPossessive',
  AmountAtLeastQuantifier: 'AmountAtLeast',
  AmountAtMostPossessiveQuantifier: 'AmountAtMostPossessive',
  AmountAtMostQuantifier: 'AmountAtMost'
}

/**
 * Parse tokens to syntax tree
 *
 * @param {Token[]} tokens
 * @returns {Node}  root node
 */
function parseTokensToSyntaxTree (tokens) {
  // Build root element
  const root = new Node('Root')

  const stack = []
  let current = root

  /**
   * Go inside node
   * and push previous one to stack
   *
   * @param {Node} node
   */
  function open (node) {
    stack.push(current)
    current = node
  }

  /**
   * Close current node
   */
  function close () {
    current = stack.pop()
  }

  /**
   * Add new children to current node
   *
   * @param {Token|Node} node
   */
  function push (node) {
    if (!(node instanceof Node)) {
      node = convertTokenToNode(node)
    }

    current.children.push(node)
  }

  // Iterate over tokens to parse them to syntax tree
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    // Ignore whitespaces
    if (token.type === 'Whitespace') {
      continue
    }

    // Handle simplest tokens - objects & indexes
    if (OBJECT_TOKENS.indexOf(token.type) !== -1 || INDEXES.indexOf(token.type) !== -1) {
      push(token)
      continue
    }

    // Handle group names
    if (token.type === 'NamedGroupStart') {
      // Validate if it's currently in Nothing group
      if (current.type !== 'Group' || current.children.length) {
        throw createSyntaxError('NamedGroupStart should be after group opening', tokens, i)
      }

      // Validate if there wasn't any NamedGroupStart yet
      if (current.data.name) {
        throw createSyntaxError('NamedGroupStart should be only after group opening', tokens, i)
      }

      // Save current group name
      current.set('name', token.data.value)

      continue
    }

    // Handle group opening
    if (token.type === 'GroupOpen') {
      const node = new Node('Group')

      push(node)
      open(node)

      continue
    }

    // Handle atomic group opening
    if (token.type === 'AtomicGroupOpen') {
      const node = new Node('AtomicGroup')

      push(node)
      open(node)

      continue
    }

    // Handle group closing
    if (token.type === 'GroupClose') {
      // Validate if there is group (or atomic group) opened
      if (current.type !== 'Group' && current.type !== 'AtomicGroup') {
        throw createSyntaxError('Unexpected group closing', tokens, i)
      }

      // Go to parent node
      close()

      continue
    }

    // Handle alternatives
    // Remember: it doesn't have right-side node yet, as it will gather it later
    if (token.type === 'AlternativeSymbol') {
      // Validate if there are children before
      if (!current.children.length) {
        current.children = [ new Node('Alternative', [ new Node('Nothing') ]) ]

        continue
      }

      const innerNode = current.children.length === 1 ? current.children[0] : new Node('Group', current.children)

      // Create 'Alternative' node
      const node = new Node('Alternative', [ innerNode ])

      // Replace left-side node with 'Alternative'
      current.children = [ node ]

      continue
    }

    // Handle quantifiers
    // as only theses left

    // Get node name for quantifier
    const name = QUANTIFIERS[token.type]

    // Validate if it's known quantifier
    if (!token.type) {
      throw new Error('Unknown token: ' + token.type)
    }

    // Get previous node for quantifier
    const previousNode = current.getLastChildren()

    // Validate if there is any node
    if (!previousNode) {
      throw createSyntaxError('Can\'t apply quantifier without left-side node', tokens, i)
    }

    // Validate if it can apply quantifier to that node
    if (QUANTIFIER_READY.indexOf(previousNode.type) === -1) {
      throw createSyntaxError('Unexpected quantifier', tokens, i)
    }

    // Apply quantifier
    const node = new Node(name, [ previousNode ], token.data)

    // Replace left-side node with new one
    current.replaceLastChildren(node)
  }

  // Apply right-side nodes for alternatives
  root.walkBack(optimizations.findRightSideForAlternatives)

  return root
}

module.exports = parseTokensToSyntaxTree
