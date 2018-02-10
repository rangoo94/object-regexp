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
  for (let i = 0; i < expectations.oneOf.length; i++) {
    const e = expectations.oneOf[i]
    const data = JSON.stringify({ type: 'oneOf', step: e.step, options: e.options })

    declareExpectations.push(`var ${e.name} = ${data}`)
    freezeExpectations.push(`Object.freeze(${e.name})`)
    freezeExpectations.push(`Object.freeze(${e.name}.options)`)

    for (let j = 0; j < e.options.length; j++) {
      freezeExpectations.push(`Object.freeze(${e.name}.options[${j}])`)
    }
  }

  // Create code for each NegatedObject expectation
  for (let i = 0; i < expectations.notOneOf.length; i++) {
    const e = expectations.notOneOf[i]
    const data = JSON.stringify({ type: 'notOneOf', step: e.step, options: e.options })

    declareExpectations.push(`var ${e.name} = ${data}`)
    freezeExpectations.push(`Object.freeze(${e.name})`)
    freezeExpectations.push(`Object.freeze(${e.name}.options)`)

    for (let j = 0; j < e.options.length; j++) {
      freezeExpectations.push(`Object.freeze(${e.name}.options[${j}])`)
    }
  }

  // Build code for declaration with optional freezing objects
  return `
    ${declareExpectations.join('\n')}

    if (Object.freeze) {
      ${freezeExpectations.join('\n')}
    }
  `
}

module.exports = buildExpectationsCode
