/**
 * Serialize node of syntax tree to equivalent string expression
 *
 * @param {Node} node
 * @returns {string}
 */
function serializeNode (node) {
  if (node.type === 'Alternative') {
    return '(' + serializeNode(node.children[0]) + '|' + serializeNode(node.children[1]) + ')'
  }

  if (node.type === 'AmountAtMost') {
    return serializeNode(node.children[0]) + '{,' + node.data.value + '}'
  }

  if (node.type === 'AmountAtLeast') {
    return serializeNode(node.children[0]) + '{' + node.data.value + ',}'
  }

  if (node.type === 'AmountBetween') {
    return serializeNode(node.children[0]) + '{' + node.data.from + ',' + node.data.to + '}'
  }

  if (node.type === 'AmountExact') {
    return serializeNode(node.children[0]) + '{' + node.data.value + '}'
  }

  if (node.type === 'Object') {
    return '[' + node.data.options.map(x => x.type + (x.value == null ? '' : '=' + x.value)).join('|') + ']'
  }

  if (node.type === 'NegatedObject') {
    return '[^' + node.data.options.map(x => x.type + (x.value == null ? '' : '=' + x.value)).join('|') + ']'
  }

  if (node.type === 'AnyObject') {
    return '.'
  }

  if (node.type === 'AnyLazy') {
    return serializeNode(node.children[0]) + '*?'
  }

  if (node.type === 'AnyGreedy') {
    return serializeNode(node.children[0]) + '*'
  }

  if (node.type === 'ManyLazy') {
    return serializeNode(node.children[0]) + '+?'
  }

  if (node.type === 'ManyGreedy') {
    return serializeNode(node.children[0]) + '+'
  }

  if (node.type === 'Optional') {
    return serializeNode(node.children[0]) + '?'
  }

  if (node.type === 'Root') {
    return node.children.map(serializeNode).join('')
  }

  if (node.type === 'Group') {
    return '(' + node.children.map(serializeNode).join('') + ')'
  }

  if (node.type === 'Nothing') {
    return ''
  }

  throw new Error('Unknown node type: ' + node.type)
}

module.exports = serializeNode
