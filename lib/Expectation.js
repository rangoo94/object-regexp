/**
 * Representation of expectation for specific node
 *
 * @param {int} type
 * @param {string} head
 * @param {object[]|null} options
 * @constructor
 */
function Expectation (type, head, options) {
  this.type = type === 1 ? 'oneOf' : type === 5 ? 'notOneOf' : 'any'
  this.head = head
  this.options = options
}

module.exports = Expectation
