const buildAlternative = require('./buildAlternativeInstructionCode')
const buildAmountAtMost = require('./buildAmountAtMostInstructionCode')
const buildAmountExact = require('./buildAmountExactInstructionCode')
const buildAnyGreedy = require('./buildAnyGreedyInstructionCode')
const buildAnyObject = require('./buildAnyObjectInstructionCode')
const buildAtomicGroup = require('./buildAtomicGroupInstructionCode')
const buildEndIndex = require('./buildEndIndexInstructionCode')
const buildFinishNamedGroup = require('./buildFinishNamedGroupInstructionCode')
const buildGroup = require('./buildGroupInstructionCode')
const buildManyLazy = require('./buildManyLazyInstructionCode')
const buildNegatedObject = require('./buildNegatedObjectInstructionCode')
const buildNothing = require('./buildNothingInstructionCode')
const buildObject = require('./buildObjectInstructionCode')
const buildOptional = require('./buildOptionalInstructionCode')
const buildRoot = require('./buildRootInstructionCode')

const builders = {
  Alternative: buildAlternative,
  AmountAtMost: buildAmountAtMost,
  AmountExact: buildAmountExact,
  AnyGreedy: buildAnyGreedy,
  AnyObject: buildAnyObject,
  AtomicGroup: buildAtomicGroup,
  EndIndex: buildEndIndex,
  FinishNamedGroup: buildFinishNamedGroup,
  Group: buildGroup,
  ManyLazy: buildManyLazy,
  NegatedObject: buildNegatedObject,
  Nothing: buildNothing,
  Object: buildObject,
  Optional: buildOptional,
  Root: buildRoot
}

/**
 * Build inline code for any instruction
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} node
 * @returns {string}
 */
function buildInstructionCode (node) {
  // Validate if it's known node type
  if (!builders[node.type]) {
    throw new Error(`Unknown node type: "${node.type}"`)
  }

  // Prepare builder
  const builder = builders[node.type]
  const build = node => buildInstructionCode(node)

  // Build inline instruction code
  return builder(node, build)
}

module.exports = buildInstructionCode
