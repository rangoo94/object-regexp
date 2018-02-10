/**
 * Build inline code for "AnyObject" instruction
 *
 * @returns {string}
 */
function buildAnyObjectInstructionCode (node) {
  // Check if any object is available
  return `
    ok = index < objects.length
    index++
    
    if (!ok) {
      if (!expectations) {
        expectations = []
      }
      expectations.push(E$${node.index})
    }
  `
}

module.exports = buildAnyObjectInstructionCode
