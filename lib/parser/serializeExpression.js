/**
 * Serialize node of syntax tree to equivalent string expression
 *
 * @param {Node} node
 * @returns {string}
 */
function serializeNode (node) {
  switch (node.type) {
    case 'Alternative':
      return '(' + serializeNode(node.children[0]) + '|' + serializeNode(node.children[1]) + ')'
    case 'AmountAtMost':
      return serializeNode(node.children[0]) + '{,' + node.data.value + '}'
    case 'AmountAtMostPossessive':
      return serializeNode(node.children[0]) + '{,' + node.data.value + '}+'
    case 'AmountAtLeast':
      return serializeNode(node.children[0]) + '{' + node.data.value + ',}'
    case 'AmountAtLeastPossessive':
      return serializeNode(node.children[0]) + '{' + node.data.value + ',}+'
    case 'AmountBetween':
      return serializeNode(node.children[0]) + '{' + node.data.from + ',' + node.data.to + '}'
    case 'AmountBetweenPossessive':
      return serializeNode(node.children[0]) + '{' + node.data.from + ',' + node.data.to + '}+'
    case 'AmountExact':
      return serializeNode(node.children[0]) + '{' + node.data.value + '}'
    case 'AnyObject':
      return '.'
    case 'AnyLazy':
      return serializeNode(node.children[0]) + '*?'
    case 'AnyPossessive':
      return serializeNode(node.children[0]) + '*+'
    case 'AnyGreedy':
      return serializeNode(node.children[0]) + '*'
    case 'ManyPossessive':
      return serializeNode(node.children[0]) + '++'
    case 'ManyLazy':
      return serializeNode(node.children[0]) + '+?'
    case 'ManyGreedy':
      return serializeNode(node.children[0]) + '+'
    case 'OptionalPossessive':
      return serializeNode(node.children[0]) + '?+'
    case 'Optional':
      return serializeNode(node.children[0]) + '?'
    case 'Root':
      return node.children.map(serializeNode).join('')
    case 'Group':
      return '(' + node.children.map(serializeNode).join('') + ')'
    case 'Nothing':
      return ''
    case 'AtomicGroup':
      return '(?>' + node.children.map(serializeNode).join('') + ')'
    case 'EndIndex':
      return '$'
    case 'Object':
      return '[' + node.data.options.map(x => x.type + (x.value == null ? '' : '=' + x.value)).join('|') + ']'
    case 'NegatedObject':
      return '[^' + node.data.options.map(x => x.type + (x.value == null ? '' : '=' + x.value)).join('|') + ']'
  }

  throw new Error('Unknown node type: ' + node.type)
}

module.exports = serializeNode
