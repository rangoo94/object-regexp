const ProcessingContext = require('./ProcessingContext')
const isValidObject = require('./isValidObject')

/**
 * That's simplified version of processing function,
 * which allow only Root, Group, Object, AnyObject & NegatedObject instructions.
 *
 * @param {Instruction} instruction
 * @param {object} groups
 * @param {object[]} objects
 * @returns {{ [expectations]: object[], [index]: number, [length]: number, [groups]: object }}
 */
function processSimpleInstruction (instruction, groups, objects) {
  const ctx = new ProcessingContext(instruction, groups)

  while (true) {
    const node = ctx.node

    // Root:
    if (node.type === 0) {
      // If something went wrong...
      if (!ctx.ok) {
        // ...Try to bailout, but if it will not work...
        if (!ctx.bailout()) {
          // Build and return failure result.
          return ctx.getFailedResult()
        }

        continue
      }

      // Get next children instruction
      const nextChildren = ctx.getNextRootChildren()

      // If all instructions has been finished,
      // return information
      if (nextChildren === null) {
        return {
          index: 0,
          length: ctx.index,
          groups: ctx.groups
        }
      }

      // Otherwise, open next children
      ctx.open(nextChildren)

      continue
    }

    // Object:
    if (node.type === 1) {
      // Get current object for comparision
      const object = objects[ctx.index]

      // Handle unexistent object or, if it exists...
      if (ctx.expectObject(object)) {
        // Handle result according to object correctness.
        ctx.acceptObject(isValidObject(object, node.data.options))
      }

      continue
    }

    // Group:
    if (node.type === 3) {
      // Get instruction which should be checked now
      const nextChildren = ctx.getNextChildren()

      // If it's before any instruction yet...
      if (nextChildren === node.firstChild) {
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

      // When all instructions in group are finished...
      if (nextChildren === null) {
        // Close named group (if name exists)
        ctx.closeGroup()

        // And go to inform a parent
        ctx.parent()

        continue
      }

      // If group is not finished yet, go to next instruction inside
      ctx.open(nextChildren)

      continue
    }

    // NegatedObject:
    if (node.type === 5) {
      // Get current object for comparision
      const object = objects[ctx.index]

      // Handle unexistent object or, if it exists...
      if (ctx.expectObject(object)) {
        // Handle result according to object correctness.
        ctx.acceptObject(!isValidObject(object, node.data.options))
      }

      continue
    }

    // AnyObject:
    if (node.type === 6) {
      // Get current object for comparision
      const object = objects[ctx.index]

      // Handle unexistent object or, if it exists...
      if (!ctx.expectObject(object)) {
        // Say that everything is OK, we accept anything.
        ctx.acceptObject(true)
      }

      continue
    }
  }
}

module.exports = processSimpleInstruction
