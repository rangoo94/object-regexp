/**
 * Represents saved context, which can be retrieved later
 *
 * @param {int} index
 * @param {Instruction} lastNode
 * @param {Instruction} node
 * @param {object} groups
 * @param {SavedContext|null} previous
 * @constructor
 */
function SavedContext (index, lastNode, node, groups, previous) {
  this.ignored = false
  this.index = index
  this.lastNode = lastNode
  this.node = node
  this.groups = groups
  this.previous = previous
}

module.exports = SavedContext
