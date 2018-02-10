const expect = require('expect.js')
const applyMacros = require('../../lib/parser/applyMacros')

const ATRULE = { from: '@(?<name>\\w+)', to: '[AtRule=$name]' }
const VALUE = { from: '\\$value', to: '[^Separator|GroupClose|ParenthesesClose]++' }
const WHITESPACE = { from: ' ', to: '[Whitespace]++' }
const COLON = { from: ':', to: '[Colon]' }

describe('applyMacros', () => {
  it('should use simple macro', () => {
    expect(applyMacros('$value', [ VALUE ])).to.eql(VALUE.to)
  })

  it('should use macro with name', () => {
    expect(applyMacros('@xyz', [ ATRULE ])).to.eql('[AtRule=xyz]')
  })

  it('should use multiple simple macros', () => {
    const result = applyMacros('[Literal]: $value', [ COLON, WHITESPACE, VALUE ])
    expect(result).to.eql('[Literal][Colon][Whitespace]++[^Separator|GroupClose|ParenthesesClose]++')
  })

  it('should use multiple macros', () => {
    const result = applyMacros('@for [Variable] @in $value', [ ATRULE, WHITESPACE, VALUE ])
    expect(result).to.eql('[AtRule=for][Whitespace]++[Variable][Whitespace]++[AtRule=in][Whitespace]++[^Separator|GroupClose|ParenthesesClose]++')
  })

  it('should validate if expression is correct string', () => {
    expect(() => applyMacros([ '[Literal]' ], [ VALUE ])).to.throwError()
  })

  it('should validate if macros are correct array', () => {
    expect(() => applyMacros('[Literal]', 'Something')).to.throwError()
  })

  it('should validate if all macros has correct format', () => {
    expect(() => applyMacros('[Literal]', [ { from: ' ', ton: '[xxx]' } ] )).to.throwError()
  })
})
