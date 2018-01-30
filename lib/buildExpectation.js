/**
 * Build more understandable expectation from node information.
 * For performance reasons it's not done immediately when expectation is found,
 * as match may finish even without it.
 *
 * @param {Instruction} node
 * @param {string|null} head
 * @returns {{ head: null|string, [oneOf]: string[], [notOneOf]: string[], [any]: boolean }}
 */
function buildExpectation ({ node, head }) {
  // Object
  if (node.type === 1) {
    return { head: head, oneOf: node.data.options }
  }

  // NegatedObject
  if (node.type === 5) {
    return { head: head, notOneOf: node.data.options }
  }

  // AnyObject
  if (node.type === 6) {
    return { head: head, any: true }
  }
}

module.exports = buildExpectation
