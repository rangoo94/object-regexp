const ProcessingContext = require('./ProcessingContext')
const isValidObject = require('./isValidObject')

/**
 * Performance info: when we use only small part of code,
 * function has not much type info (i.e. 24%) what makes it twice as slower,
 * that's why it's important to have different processor for simple instructions
 * (in processSimpleInstructions.js)
 *
 * @param {Instruction} instruction
 * @param {object} groups
 * @param {object[]} objects
 * @param {int} startIndex
 * @returns {{ [expectations]: object[], [index]: number, [length]: number, [groups]: object }}
 */
function processInstruction (instruction, groups, objects, startIndex) {
  const ctx = new ProcessingContext(instruction, groups, startIndex)

  // Go to first instruction in Root node
  ctx.firstChild()

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

    // Nothing:
    if (node.type === 9) {
      // It should be just always accepted
      ctx.ok = true

      // Go to next sibling or inform a parent
      ctx.next()

      continue
    }

    // Object:
    if (node.type === 1) {
      // Get current object for comparison
      const object = objects[ctx.index]

      // Handle not existing object or, if it exists...
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

      // Second instruction has been finished successfully,
      // So go to next sibling or parent
      if (nextChildren === null && ctx.ok) {
        ctx.next()

        continue
      }

      // First option has failed before,
      // and now second option has failed as well,
      // So go to inform a parent
      if (nextChildren === null && !ctx.ok) {
        ctx.parent()

        continue
      }

      // First option hasn't been tested yet,
      // So go inside.
      if (nextChildren.nextSibling) {
        ctx.open(nextChildren)

        continue
      }

      // First option has failed,
      // But we can check second option, so do it.
      if (!nextChildren.nextSibling && !ctx.ok) {
        ctx.open(nextChildren)

        continue
      }

      // First option has succeed.
      // Save information, that eventually (on later fail) we can continue back with 2nd option.
      ctx.save()

      // Go to next sibling of Alternative, as it succeed
      ctx.next()

      continue
    }

    // Group:
    // It will fire either before group has started,
    // Or after all their children failed all succeed
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

    // AnyGreedy:
    // Important - it has single children
    if (node.type === 4) {
      // When last time children failed...
      if (!ctx.ok) {
        // Ignore last saved context (as it's not important anymore, there is nothing to get back to)
        ctx.ignoreLastContext()

        // Mark as success (because AnyGreedy allows even 0 elements)
        ctx.ok = true

        // Go to next instruction as it succeed anyway
        ctx.next()

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

      // Handle not existing object or, if it exists...
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

      // Handle not existing object or, if it exists...
      if (ctx.expectObject(object)) {
        // Say that everything is OK, we accept anything.
        ctx.acceptObject(true)
      }

      continue
    }

    // EndIndex:
    if (node.type === 11) {
      // Get current object for comparision
      const object = objects[ctx.index]

      // Accept only if there is no objects left.
      ctx.ok = !object

      // Go to parent, as there shouldn't be anything else (or failed)
      ctx.parent()

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

      // Go to next sibling or inform a parent
      ctx.next()

      continue
    }

    // ManyLazy:
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

      // Go to next sibling or inform a parent
      ctx.next()

      continue
    }

    // AtomicGroup
    if (node.type === 10) {
      // If it's before any instruction yet...
      if (ctx.isBeforeChildren()) {
        // Make copy of previous saved contexts (and remove them from current stack)
        node.lastContext = ctx.savedContext
        ctx.savedContext = null

        // And go to first child
        ctx.firstChild()

        continue
      }

      // Otherwise, if something failed inside...
      if (!ctx.ok) {
        // Handle bailout (inside)...
        if (ctx.bailout()) {
          continue
        }

        // ...or get back with previous saved contexts
        ctx.savedContext = node.lastContext

        // And go to inform a parent
        ctx.parent()

        continue
      }

      // Get back with previous saved contexts
      ctx.savedContext = node.lastContext

      // And go to next sibling or inform a parent
      ctx.next()

      continue
    }
  }
}

module.exports = processInstruction
