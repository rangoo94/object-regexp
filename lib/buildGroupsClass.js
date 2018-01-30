const EmptyGroups = require('./EmptyGroups')

const BEGIN = 'function Groups (group) {'
const END = '} Groups.prototype.clone = function clone () { return new this.constructor(this) }; return Groups'

/**
 * Build Group class,
 * for better performance of creating and cloning groups.
 *
 * @param {Node} rootNode
 * @returns {function}
 */
function buildGroupsClass (rootNode) {
  const namedGroups = []

  // Gather all group names
  rootNode.walk(node => {
    if (node.type === 'Group' && node.data.name !== void 0) {
      namedGroups.push(node.data.name)
    }
  })

  if (namedGroups.length === 0) {
    return EmptyGroups
  }

  let code = BEGIN

  // Create initialization code for all named groups
  for (let i = 0; i < namedGroups.length; i++) {
    code += 'this.' + namedGroups[i] + ' = group.' + namedGroups[i] + ';'
  }

  code += END

  // Build Group constructor
  // eslint-disable-next-line
  return new Function(code)()
}

module.exports = buildGroupsClass
