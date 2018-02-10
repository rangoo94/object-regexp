const expect = require('expect.js')
const compile = require('../../lib/compileExpression')
const toSyntaxTree = require('../../lib/parser/parseExpressionToSyntaxTree')

const _ = require('../utils').buildNode

describe('E2E: Optional instruction', () => {
  it('should take element simply', () => {
    const matcher = compile('[A]?')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should not take element simply', () => {
    const matcher = compile('[B]?')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 0,
      expectations: null,
      groups: {}
    })
  })

  it('should fallback to no element', () => {
    const matcher = compile('[A]?[A][B]')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {}
    })
  })

  it('should handle incorrect groups inside (without fallback)', () => {
    const matcher = compile('([A][B])?[A]')
    const list = [ _('A'), _('B'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })

  it('should handle incorrect groups inside (take fallback)', () => {
    const matcher = compile('([A][B])?[B]')
    const list = [ _('B'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })
})
