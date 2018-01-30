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
      if (!ctx.ok) {
        if (!ctx.bailout()) {
          return ctx.getFailedResult()
        }

        continue
      }

      const nextChildren = ctx.getNextRootChildren()

      if (nextChildren === null) {
        return {
          index: 0,
          length: ctx.index,
          groups: ctx.groups
        }
      }

      ctx.open(nextChildren)

      continue
    }

    // Object:
    if (node.type === 1) {
      const object = objects[ctx.index]

      if (ctx.expectObject(object)) {
        ctx.acceptObject(isValidObject(object, node.data.options))
      }

      continue
    }

    // Alternative:
    if (node.type === 2) {
      const nextChildren = ctx.getNextChildren()

      if (nextChildren.nextSibling || (!nextChildren.nextSibling && !ctx.ok)) {
        ctx.open(nextChildren)

        continue
      }

      if (!nextChildren.nextSibling) {
        ctx.save()
      }

      ctx.parent()

      continue
    }

    // Group:
    if (node.type === 3) {
      const nextChildren = ctx.getNextChildren()

      if (nextChildren === node.firstChild) {
        ctx.openGroup()
        ctx.firstChild()

        continue
      }

      if (!ctx.ok) {
        ctx.abortGroup()
        ctx.parent()

        continue
      }

      if (nextChildren === null) {
        ctx.closeGroup()
        ctx.parent()

        continue
      }

      ctx.open(nextChildren)

      continue
    }

    // AnyGreedy:
    if (node.type === 4) {
      if (!ctx.ok) {
        ctx.ignoreLastContext()
        ctx.ok = true
        ctx.parent()

        continue
      }

      ctx.save()
      ctx.firstChild()

      continue
    }

    // NegatedObject:
    if (node.type === 5) {
      const object = objects[ctx.index]

      if (ctx.expectObject(object)) {
        ctx.acceptObject(!isValidObject(object, node.data.options))
      }

      continue
    }

    // AnyObject:
    if (node.type === 6) {
      const object = objects[ctx.index]

      if (!ctx.expectObject(object)) {
        ctx.acceptObject(true)
      }

      continue
    }

    // Optional:
    if (node.type === 7) {
      if (ctx.isBeforeChildren()) {
        if (node.lastContext.index !== ctx.index) {
          ctx.save()
        }

        ctx.firstChild()

        continue
      }

      ctx.ignoreLastContextOnFail()

      ctx.ok = true
      ctx.parent()

      continue
    }

    // ManyLazy:
    if (node.type === 8) {
      if (ctx.isBeforeChildren()) {
        ctx.save()
        ctx.firstChild()

        continue
      }

      ctx.ignoreLastContextOnFail()
      ctx.overwriteLastContextIndex()

      ctx.ok = true
      ctx.parent()

      continue
    }
  }
}

module.exports = processInstruction
