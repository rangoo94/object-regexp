const ProcessingContext = require('./ProcessingContext')
const isValidObject = require('./isValidObject')

/**
 * Performance info: when we use only small part of code,
 * function has not much type info (i.e. 24%) what makes it twice as slower,
 * that's why it's important to compile processing function for simpler cases.
 *
 * @param {Instruction} instruction
 * @param {object} groups
 * @param {object[]} objects
 * @returns {{ [expectations]: object[], [index]: number, [length]: number, [groups]: object }}
 */
function processInstruction (instruction, groups, objects) {
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

    // Alternative:
    if (node.type === 2) {
      // Get instruction which should be checked now
      const nextChildren = ctx.getNextChildren()

      // When it's first instruction (has a sibling) or it's 2nd instruction, but first failed...
      if (nextChildren.nextSibling || (!nextChildren.nextSibling && !ctx.ok)) {
        // ...open current instruction
        ctx.open(nextChildren)

        continue
      }

      // When the first instruction has finished successfully...
      if (!nextChildren.nextSibling) {
        // Save information, that eventually (on fail) we can continue back with 2nd alternative.
        ctx.save()
      }

      // Go back to parent to inform about results
      ctx.parent()

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

    // AnyGreedy:
    // Important - it has single children
    if (node.type === 4) {
      // When last time children failed...
      if (!ctx.ok) {
        // Ignore last saved context (as it's not important anymore, there is nothing to get back to)
        ctx.ignoreLastContext()

        // Mark as success (because AnyGreedy allows even 0 elements)
        ctx.ok = true

        // And go inform a parent()
        ctx.parent()

        continue
      }

      // When it succeed, or just started, save information that probably we could start again here (on fail)
      ctx.save()

      // Go to instruction, to continue loop
      ctx.firstChild()

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

    // Optional:
    if (node.type === 7) {
      // When it has not checked instruction yet...
      if (ctx.isBeforeChildren()) {
        // And it's not because of coming back...
        if (node.lastContext.index !== ctx.index) {
          // Save current state, because no value is correct value here as well :)
          ctx.save()
        }

        // Go to instruction
        ctx.firstChild()

        continue
      }

      // Ignore last saved context if it has failed
      ctx.ignoreLastContextOnFail()

      // Save information that it succeed, because Optional accept anything
      ctx.ok = true

      // Go to parent
      ctx.parent()

      continue
    }

    // AnyLazy:
    if (node.type === 8) {
      // When it has not checked instruction yet...
      if (ctx.isBeforeChildren()) {
        // Save last context (which will have index overwritten on success anyway), to have a pointer in right place
        ctx.save()

        // Go to first child
        ctx.firstChild()

        continue
      }

      // Ignore last saved context if it has failed
      ctx.ignoreLastContextOnFail()

      // Overwrite index in last context, as we have to be sure that we passed last children already
      ctx.overwriteLastContextIndex()

      // Save information that it succeed, because AnyLazy accept anything
      ctx.ok = true

      // Go to parent
      ctx.parent()

      continue
    }
  }
}

module.exports = processInstruction
