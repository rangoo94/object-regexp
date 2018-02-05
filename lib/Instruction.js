const SavedContext = require('./SavedContext')
const Expectation = require('./Expectation')

/**
 * Representation of expression instruction
 *
 * @param {Instruction|null} nextSibling
 * @param {int} type
 * @param {Instruction|null} parentNode
 * @param {object} data
 * @param {Instruction[]} children
 * @param {boolean} isLastAtomicOperation
 * @param {boolean} isLoop
 * @param {string|null} head
 * @constructor
 */
function Instruction (nextSibling, type, parentNode, data, children, isLastAtomicOperation, isLoop, head) {
  this.type = type
  this.isLastAtomicOperation = isLastAtomicOperation
  this.isLoop = isLoop
  this.data = data
  this.children = children
  this.head = head
  this.parentNode = parentNode
  this.nextSibling = nextSibling
  this.expectation = new Expectation(type, head, data.options)

  // We don't want to use this context,
  // but V8 will have easier assumption about lastContext,
  // and will make it faster.
  this.lastContext = new SavedContext(0, this, this, {}, null)

  this.firstChild = null
  this.previousHead = null
  this.start = null
}

module.exports = Instruction
