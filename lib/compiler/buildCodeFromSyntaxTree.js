const buildEmptyExpressionCode = require('./buildEmptyExpressionCode')
const buildInstructionCode = require('./buildInstructionCode')
const buildGroupsClassCode = require('./buildGroupsClassCode')
const buildExpectationsCode = require('./buildExpectationsCode')

/**
 * Build inline matching code from syntax tree
 *
 * @param {Node|{ isStraightForward: boolean, index: int, nextIndex: int }} rootNode
 * @returns {string}
 */
function buildCodeFromSyntaxTree (rootNode) {
  // Build empty function code, when there is no instruction
  if (rootNode.children.length === 0) {
    return buildEmptyExpressionCode()
  }

  // Build matching code
  return `(function () {
    ${buildGroupsClassCode(rootNode)}

    var initialGroups = new Groups({})

    ${buildExpectationsCode(rootNode)}

    /* Generated by object-regexp library */
    function matchExpression (objects, startIndex) {
      startIndex = startIndex || 0
      var step = 0
      var index = startIndex
      var ok = true
      var fallback = null
      var expectations = null
      var groups = initialGroups

      while (true) {
        ${buildInstructionCode(rootNode)}

        if (!ok) {
          while (fallback && fallback.ignored) {
            fallback = fallback.previous
          }
      
          if (fallback) {
            step = fallback.step
            index = fallback.index
            groups = fallback.groups
            fallback = fallback.previous
            ok = true
            continue
          }

          break
        }

        return {
          finished: true,
          index: startIndex,
          length: index - startIndex,
          expectations: expectations,
          groups: groups
        }
      }

      return expectations ? {
        finished: false,
        expectations: expectations
      } : null
    }

    return matchExpression
  })()`
}

module.exports = buildCodeFromSyntaxTree
