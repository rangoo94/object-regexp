const Node = require('./Node')

/**
 * Convert token to simple node
 *
 * @param {Token} token
 * @param {string} [type]
 * @returns {Node}
 */
function convertTokenToNode (token, type) {
  return new Node(type || token.type, null, token.data)
}

module.exports = convertTokenToNode
