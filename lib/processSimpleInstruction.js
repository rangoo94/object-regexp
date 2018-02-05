const ProcessingContext = require('./ProcessingContext')
const isValidObject = require('./isValidObject')

/**
 * That's simplified version of processing function,
 * which allow only Root, Group, Object, AnyObject & NegatedObject instructions.
 *
 * @param {Instruction} instruction
 * @param {object} groups
 * @param {object[]} objects
 * @param {int} startIndex
 * @returns {{ [expectations]: object[], [index]: number, [length]: number, [groups]: object }}
 */
function processSimpleInstruction (instruction, groups, objects, startIndex) {
  const ctx = new ProcessingContext(instruction, groups, startIndex)
  const len = objects.length

  while (true) {
    const node = ctx.node

    // Root:
    // It will fire only if everything is ready (either successfully or not)
    if (node.type === 0) {
      // Handle success on all children
      if (ctx.ok) {
        return ctx.getSuccessResult()
      }

      // If something went wrong try to bailout, but if it will not work...
      if (!ctx.bailout()) {
        // Build and return failure result.
        return ctx.getFailedResult()
      }

      continue
    }

    // Object:
    if (node.type === 1) {
      // When there is no more objects available...
      if (len <= ctx.index) {
        ctx.expectObject()
        continue
      }

      // Get current object for comparison
      const object = objects[ctx.index]

      ctx.acceptObject(isValidObject(object, node.data.options))
      continue
    }

    // Group:
    if (node.type === 3) {
      // If it's before any instruction yet...
      if (ctx.isBeforeChildren()) {
        // Try opening a named group (if name exists)
        ctx.openGroup()

        // And go to first child
        ctx.firstChild()

        continue
      }

      // Otherwise, if something failed inside...
      if (!ctx.ok) {
        // Abort named group (if name exists)
        ctx.abortGroup()

        // And go to inform a parent
        ctx.parent()

        continue
      }

      // Close named group (if name exists)
      ctx.closeGroup()

      // And go to next sibling or inform a parent
      ctx.next()

      continue
    }

    // NegatedObject:
    if (node.type === 5) {
      // When there is no more objects available...
      if (len <= ctx.index) {
        ctx.expectObject()
        continue
      }

      // Get current object for comparison
      const object = objects[ctx.index]

      ctx.acceptObject(!isValidObject(object, node.data.options))
      continue
    }

    // AnyObject:
    if (node.type === 6) {
      // When there is no more objects available...
      if (len <= ctx.index) {
        ctx.expectObject()
        continue
      }

      ctx.acceptObject(true)
      continue
    }

    // EndIndex:
    if (node.type === 11) {
      // Accept only if there is no objects left.
      ctx.ok = len <= ctx.index

      // Go to parent, as there shouldn't be anything else (or failed)
      ctx.parent()

      continue
    }
  }
}

module.exports = processSimpleInstruction
