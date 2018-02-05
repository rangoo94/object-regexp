const SavedContext = require('./SavedContext')
const buildExpectation = require('./buildExpectation')

/**
 * Processing context.
 * It works faster then `processing` function is creating such context,
 * than if context has its own `processing` procedure.
 *
 * @param {Instruction} rootNode
 * @param {object} initialGroups
 * @param {int} startIndex
 * @constructor
 */
function ProcessingContext (rootNode, initialGroups, startIndex) {
  this.startIndex = this.index = startIndex || 0
  this.lastNode = rootNode
  this.node = rootNode.firstChild
  this.ok = true
  this.expectations = []
  this.head = null
  this.savedContext = null
  this.groups = initialGroups
}

/**
 * Start escaping procedure, because something went wrong
 *
 * @returns {boolean|null}
 */
ProcessingContext.prototype.bailout = function bailout () {
  // Omit bailouts which are marked as ignored
  while (this.savedContext && this.savedContext.ignored) {
    this.savedContext = this.savedContext.previous
  }

  // Return false if no saved context found
  if (this.savedContext === null) {
    return false
  }

  // Escape to next bailout
  this.escape()

  return true
}

/**
 * Escape to last saved state.
 * This method assumes that there is next saved bailout state
 */
ProcessingContext.prototype.escape = function restore () {
  // Get last bailout
  const savedContext = this.savedContext

  // Restore data from saved context
  this.index = savedContext.index
  this.lastNode = savedContext.lastNode
  this.node = savedContext.node

  // Escape means that something went wrong, so mark as false
  this.ok = false

  // Set pointer to next savedContext
  this.savedContext = savedContext.previous
}

/**
 * Save current state.
 * It also pass context to node, as it has to know where go further.
 */
ProcessingContext.prototype.save = function save () {
  if (this.node.isLastAtomicOperation) {
    // We don't have to save last context of last children in atomic group. It should never be recovered.
    return
  }

  this.savedContext = this.node.lastContext = new SavedContext(
    this.index,
    this.lastNode,
    this.node,
    this.groups.clone(),
    this.savedContext
  )
}

/**
 * Go back to parent node.
 */
ProcessingContext.prototype.parent = function parent () {
  this.lastNode = this.node
  this.node = this.lastNode.parentNode
}

/**
 * Go to next node (either next sibling or to parent node).
 */
ProcessingContext.prototype.next = function next () {
  const node = this.node

  // Speed up "ManyPossessive" nodes with single instruction (up to 40% faster),
  // costs other queries ~0-2% of speed
  if (node.isLoop) {
    this.lastNode = node.parentNode
    return
  }

  this.lastNode = node
  this.node = node.nextSibling || node.parentNode
}

/**
 * Most of instructions has just single instruction below.
 * This method is simplified:
 * ProcessingContext::open(ProcessingContext::getNextChildren())
 * using faster field in node.
 *
 * Doesn't reuse it, because of performance.
 */
ProcessingContext.prototype.firstChild = function firstChild () {
  this.lastNode = this.node
  this.node = this.lastNode.firstChild
}

/**
 * Go to selected instruction.
 */
ProcessingContext.prototype.open = function open (node) {
  this.lastNode = this.node
  this.node = node
}

/**
 * Helper method to handle logic branch, when there is missing object.
 * Used in Object|NegatedObject|AnyObject instructions only.
 *
 * @returns {boolean}
 */
ProcessingContext.prototype.expectObject = function expectObject () {
  // Object doesn't exists, but was expected.
  this.ok = false

  // Add expectation, as this regex may be continued with proper object.
  this.expectations.push(buildExpectation(this.node, this.head))

  // Go to parent, as we are done in this object
  this.parent()

  // Block success flow
  return false
}

/**
 * Helper method to handle logic branch, when object is validated already.
 * Used in Object|NegatedObject|AnyObject instructions only.
 *
 * @param {boolean} ok
 */
ProcessingContext.prototype.acceptObject = function acceptObject (ok) {
  // Save information if it has been accepted
  this.ok = ok

  // Increment objects index on success
  if (ok) {
    this.index++
    this.next()
    return
  }

  // Go to parent or next object, as we are done in this object
  this.parent()
}

/**
 * Get next own children to process.
 *
 * @returns {Instruction}
 */
ProcessingContext.prototype.getNextChildren = function () {
  return this.lastNode.parentNode !== this.node ? this.node.firstChild : this.lastNode.nextSibling
}

/**
 * Check if node has already started processing children.
 *
 * @returns {boolean}
 */
ProcessingContext.prototype.isBeforeChildren = function isBeforeChildren () {
  return this.lastNode.parentNode !== this.node
}

/**
 * Build final result from context if everything has failed.
 *
 * @returns {null|{ finished: boolean, expectations: Array<{ head: null|string, [oneOf]: string[], [notOneOf]: string[], [any]: boolean }> }}
 */
ProcessingContext.prototype.getFailedResult = function getFailedResult () {
  return this.expectations.length ? {
    finished: false,
    expectations: this.expectations
  } : null
}

/**
 * Build final result from context if everything has succeed
 *
 * @returns {{ finished: boolean, expectations: Array<{ head: null|string, [oneOf]: string[], [notOneOf]: string[], [any]: boolean }>, index: number, length: number, groups: object }}
 */
ProcessingContext.prototype.getSuccessResult = function getSuccessResult () {
  return {
    finished: true,
    expectations: this.expectations,
    index: this.startIndex,
    length: this.index - this.startIndex,
    groups: this.groups
  }
}

/**
 * Open group, by setting new `head` information in context.
 */
ProcessingContext.prototype.openGroup = function openGroup () {
  const node = this.node

  // Get name from current group
  const name = node.data.name

  // When name exists...
  if (name !== void 0) {
    // Save information about index where this group has started
    node.start = this.index

    // Save information which head was above (to get back after closing current group)
    node.previousHead = this.head

    // And save information about current head
    this.head = name
  }
}

/**
 * Something went wrong inside of group,
 * so close group without saving nodes
 */
ProcessingContext.prototype.abortGroup = function abortGroup () {
  // Get name from current group
  const name = this.node.data.name

  // When name exists (it means that group has opened before),
  // Revert information about previous head
  if (name !== void 0) {
    this.head = this.node.previousHead
  }
}

/**
 * Group has succeeded, so save information about its nodes,
 * and close group
 */
ProcessingContext.prototype.closeGroup = function closeGroup () {
  const node = this.node

  // Get name from current group
  const name = node.data.name

  // When name exists (it means that group has opened before)...
  if (name !== void 0) {
    // Save information about current group
    this.groups[name] = { from: node.start, to: this.index }

    // Revert information about previous head
    this.head = node.previousHead
  }
}

/**
 * Replace index in last context, to current index.
 */
ProcessingContext.prototype.overwriteLastContextIndex = function overwriteLastContextIndex () {
  this.node.lastContext.index = this.index
}

/**
 * Mark last context as ignored.
 */
ProcessingContext.prototype.ignoreLastContext = function ignoreLastContext () {
  this.node.lastContext.ignored = true
}

/**
 * Mark last context as ignored if last instruction failed.
 */
ProcessingContext.prototype.ignoreLastContextOnFail = function ignoreLastContextOnFail () {
  if (!this.ok) {
    this.node.lastContext.ignored = true
  }
}

module.exports = ProcessingContext
