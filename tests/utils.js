/**
 * Build simply node
 *
 * @param {object} type
 * @param {*} [value]
 * @returns {object}
 */
function buildNode (type, value) {
  if (value !== void 0) {
    return { type: type, data: { value: value } }
  }

  return { type: type }
}

/**
 * Repeat nodes specified number times
 *
 * @param {int} times
 * @param {object|object[]} nodes
 * @returns {object[]}
 */
function repeatNodes (times, nodes) {
  // Allow single node as well
  nodes = [].concat(nodes)

  // Build basic result
  let result = []

  // Repeat nodes specified number of times
  for (let i = 0; i < times; i++) {
    result = result.concat(nodes)
  }

  return result
}

exports.buildNode = buildNode
exports.repeatNodes = repeatNodes
