const EmptyGroups = require('./EmptyGroups')

/**
 * As before loop in processInstruction/processSimpleInstruction
 * we are going into first child of Root element,
 * we have to handle edge case that there will be no instructions.
 */
function processEmptyInstruction (objects, startIndex) {
  return {
    index: startIndex || 0,
    length: 0,
    groups: new EmptyGroups({})
  }
}

module.exports = processEmptyInstruction
