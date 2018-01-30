const optimizations = require('./optimizations')

/**
 * Optimize syntax tree for use
 *
 * @param {Node} root
 */
function optimizeSyntaxTree (root) {
  // Simplify nodes for processor
  root.walkBack(optimizations.simplifyAmountAtLeastInstruction)
  root.walkBack(optimizations.simplifyAmountBetweenInstruction)
  root.walkBack(optimizations.simplifyAmountAtMostInstruction)
  root.walkBack(optimizations.simplifyManyGreedyInstruction)
  root.walkBack(optimizations.simplifyAmountExactInstruction)
  root.walkBack(optimizations.simplifyManyLazyInstruction)

  // Remove unneeded nodes (empty groups or Nothing in root or groups nodes)
  root.walkBackEnd(optimizations.removeRedundantNodes)

  // Optimize object alternatives
  root.walkBack(optimizations.optimizeObjectAlternatives)

  // Remove unneeded nodes once again (after unpacking alternatives)
  root.walkBackEnd(optimizations.removeRedundantNodes)

  // Remove redundant object types
  root.walkBack(optimizations.removeObjectRedundancy)

  return root
}

module.exports = optimizeSyntaxTree
