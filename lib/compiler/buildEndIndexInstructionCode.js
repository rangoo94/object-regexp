/**
 * Build inline code for "EndIndex" instruction
 *
 * @returns {string}
 */
function buildEndIndexInstructionCode () {
  return 'ok = index >= objects.length'
}

module.exports = buildEndIndexInstructionCode
