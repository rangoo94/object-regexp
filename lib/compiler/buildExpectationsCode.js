/**
 * Find all expectations which are possible in expression
 *
 * @param {Node} rootNode
 * @returns {{ any: object[], oneOf: object[], notOneOf: object[] }}
 */
function findAllExpectations (rootNode) {
  // Build basic result
  const expectations = {
    any: [],
    oneOf: [],
    notOneOf: []
  }

  // Populate list of found expectations
  rootNode.walk(node => {
    if (node.type === 'AnyObject') {
      expectations.any.push({ name: `E$${node.index}`, step: node.index })
    }

    if (node.type === 'Object') {
      expectations.oneOf.push({ name: `E$${node.index}`, step: node.index, options: node.data.options })
    }

    if (node.type === 'NegatedObject') {
      expectations.notOneOf.push({ name: `E$${node.index}`, step: node.index, options: node.data.options })
    }
  })

  return expectations
}

/**
 * Analyze Object/NegatedObject expectations and build their code
 *
 * @param {string} type
 * @param {object[]} expectations
 * @param {object[]} declare
 * @param {object[]} freeze
 */
function analyzeObjectExpectations (type, expectations, declare, freeze) {
  for (let i = 0; i < expectations.length; i++) {
    const e = expectations[i]
    const data = JSON.stringify({ type: type, step: e.step, options: e.options })

    declare.push(`var ${e.name} = ${data}`)
    freeze.push(`Object.freeze(${e.name})`)
    freeze.push(`Object.freeze(${e.name}.options)`)

    for (let j = 0; j < e.options.length; j++) {
      freeze.push(`Object.freeze(${e.name}.options[${j}])`)
    }
  }
}

/**
 * Build code for expectations in expression
 *
 * @param {Node} rootNode
 * @returns {string}
 */
function buildExpectationsCode (rootNode) {
  // Find all expectations which should be declared
  const expectations = findAllExpectations(rootNode)

  // Create list with expectations declarations and freezing their objects
  const declareExpectations = []
  const freezeExpectations = []

  // Create code for each AnyObject expectation
  for (let i = 0; i < expectations.any.length; i++) {
    const e = expectations.any[i]
    const data = JSON.stringify({ type: 'any', step: e.step })

    declareExpectations.push(`var ${e.name} = ${data}`)
    freezeExpectations.push(`Object.freeze(${e.name})`)
  }

  // Create code for each Object expectation
  analyzeObjectExpectations('oneOf', expectations.oneOf, declareExpectations, freezeExpectations)

  // Create code for each NegatedObject expectation
  analyzeObjectExpectations('notOneOf', expectations.notOneOf, declareExpectations, freezeExpectations)

  // Build code for declaration with optional freezing objects
  return `
    ${declareExpectations.join('\n')}

    if (Object.freeze) {
      ${freezeExpectations.join('\n')}
    }
  `
}

module.exports = buildExpectationsCode
