const UniversalLexer = require('universal-lexer')
const parseTokenName = require('./parseTokenName')

const lexer = UniversalLexer.fromDefinitions([
  {
    type: 'Whitespace',
    regex: '[\\r\\n\\t ]+'
  },
  {
    type: 'NegatedObject',
    regex: '\\[\\^(?<value>[a-zA-Z=|]+)\\]'
  },
  {
    type: 'Object',
    regex: '\\[(?<value>[a-zA-Z=|]+)\\]'
  },
  {
    type: 'AmountAtLeastPossessiveQuantifier',
    regex: '\\{(?<value>\\d+),\\}\\+'
  },
  {
    type: 'AmountAtLeastQuantifier',
    regex: '\\{(?<value>\\d+),\\}'
  },
  {
    type: 'AmountExactQuantifier',
    regex: '\\{(?<value>\\d+)}'
  },
  {
    type: 'AmountBetweenPossessiveQuantifier',
    regex: '\\{(?<from>\\d+),(?<to>\\d+)}\\+'
  },
  {
    type: 'AmountBetweenQuantifier',
    regex: '\\{(?<from>\\d+),(?<to>\\d+)}'
  },
  {
    type: 'AmountAtMostPossessiveQuantifier',
    regex: '\\{,(?<value>\\d+)}\\+'
  },
  {
    type: 'AmountAtMostQuantifier',
    regex: '\\{,(?<value>\\d+)}'
  },
  {
    type: 'ManyLazyQuantifier',
    value: '+?'
  },
  {
    type: 'ManyPossessiveQuantifier',
    value: '++'
  },
  {
    type: 'ManyGreedyQuantifier',
    value: '+'
  },
  {
    type: 'AnyLazyQuantifier',
    value: '*?'
  },
  {
    type: 'AnyPossessiveQuantifier',
    value: '*+'
  },
  {
    type: 'AnyGreedyQuantifier',
    value: '*'
  },
  {
    type: 'AnyObject',
    value: '.'
  },
  {
    type: 'AtomicGroupOpen',
    value: '(?>'
  },
  {
    type: 'GroupOpen',
    value: '('
  },
  {
    type: 'GroupClose',
    value: ')'
  },
  {
    type: 'AlternativeSymbol',
    value: '|'
  },
  {
    type: 'NamedGroupStart',
    regex: '\\?\\<(?<value>[a-zA-Z0-9_-]+)\\>'
  },
  {
    type: 'OptionalPossessiveQuantifier',
    value: '?+'
  },
  {
    type: 'OptionalQuantifier',
    value: '?'
  }
])

/**
 * Parse object types
 *
 * @param {{ value: string }} match
 * @returns {{ options: Array<{ type: string, [value]: string }> }}
 */
function parseObjectTypes (match) {
  return {
    options: match.value.split('|').map(parseTokenName)
  }
}

lexer.addProcessor('Object', parseObjectTypes)
lexer.addProcessor('NegatedObject', parseObjectTypes)

module.exports = lexer
