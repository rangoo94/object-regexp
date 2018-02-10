const beautifyjs = require('js-beautify')

/**
 * Trim spaces in code
 *
 * @param {string} code
 * @returns {string}
 */
function trimSpaces (code) {
  return code
    .replace(/[ \t\r]+\n/g, '\n') // remove spaces on end of line
    .replace(/\n[\n]+/g, '\n') // allow maximum of one empty line between instructions
}

/**
 * Beautify JS code to make it simpler
 *
 * @param {string} code
 * @returns {string}
 */
function beautify (code) {
  return beautifyjs(trimSpaces(code), { indent_size: 2, space_in_empty_paren: false })
}

/**
 * Build code for cases in switcher
 *
 * @param {Node|{ index: int, innerIndexes: int[] }} node
 * @returns {string}
 */
function cases (node) {
  const innerCases = node.innerIndexes.map(x => `case ${x}:`).join(' ')
  return `case ${node.index}: step = ${node.index}\n      ` + innerCases
}

/**
 * Build internal variable name
 *
 * @param {Node|{ index: int }} node
 * @param {string} name
 * @returns {string}
 */
function variable (node, name) {
  return name + '$' + node.index
}

/**
 * Build code for creating new fallback
 *
 * @param {string|int} [step]
 * @param {string|int} [index]
 * @param {string} [groups]
 * @returns {string}
 */
function createFallback (step, index, groups) {
  return `
    fallback = {
      index: ${index === void 0 ? 'index' : index},
      step: ${step === void 0 ? 'step' : step},
      previous: fallback,
      groups: ${groups === void 0 ? 'groups' : groups},
      next: null
    }
  `
}

/**
 * Build code for ignoring selected fallback
 *
 * @param {string} variableName
 * @returns {string}
 */
function ignoreFallback (variableName) {
  return `
    ${variableName}.ignored = true
  `
}

/**
 * Build universal code for fallback,
 * both creating and ignoring fallback
 *
 * @param {string|null} variableName
 * @param {string|int} [step]
 * @param {string|int} [index]
 * @param {string} [groups]
 * @returns {{ create: string, ignore: string }}
 */
function buildFallback (variableName, step, index, groups) {
  return {
    create: 'var ' + variableName + ' = ' + createFallback(step, index, groups),
    ignore: ignoreFallback(variableName)
  }
}

/**
 * Build code for cases inside of switcher
 *
 * @param {Node[]} nodes
 * @param {function(Node)} build
 * @returns {string}
 */
function buildCasesCode (nodes, build) {
  return nodes.map(x => `
    ${cases(x)} ${build(x)}

    if (!ok) {
      break
    }
  `).join('')
}

exports.trimSpaces = trimSpaces
exports.beautify = beautify
exports.cases = cases
exports.variable = variable
exports.createFallback = createFallback
exports.ignoreFallback = ignoreFallback
exports.buildFallback = buildFallback
exports.buildCasesCode = buildCasesCode
