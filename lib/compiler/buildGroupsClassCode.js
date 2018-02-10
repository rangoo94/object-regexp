/**
 * Find all names of groups
 *
 * @param {Node} rootNode
 * @returns {string[]}
 */
function findAllNamedGroups (rootNode) {
  const namedGroups = []

  rootNode.walk(node => {
    if (node.type === 'Group' && node.data.name !== void 0) {
      namedGroups.push(node.data.name)
    }
  })

  return namedGroups
}

/**
 * Build code for Groups class
 *
 * @param {Node} rootNode
 * @returns {string}
 */
function buildGroupsClassCode (rootNode) {
  const namedGroups = findAllNamedGroups(rootNode)
  const properties = namedGroups.map(
    name => `this[${JSON.stringify(name)}] = o[${JSON.stringify(name)}]`
  )

  return `
    function Groups (o) {
      ${properties.join('\n')}
    }

    Groups.prototype.set = function setGroup (name, from, to) {
      var copy = new Groups(this)
      copy[name] = { from: from, to: to }
      return copy
    }
  `
}

module.exports = buildGroupsClassCode
