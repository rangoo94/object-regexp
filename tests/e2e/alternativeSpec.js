const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode

describe('E2E: Alternative instruction', () => {
  it('should take first instruction correctly', () => {
    const matcher = compile('([A][B]|[C])')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {}
    })
  })

  it('should take first instruction partially correctly', () => {
    const matcher = compile('([A][B]|[C])')
    const list = [ _('A') ]

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 4, options: [ { type: 'B' } ] } ]
    })
  })

  it('should take second instruction correctly', () => {
    const matcher = compile('([A][B]|[B])')
    const list = [ _('B'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should take second instruction partially correctly', () => {
    const matcher = compile('([C]|[A][B])')
    const list = [ _('A') ]

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 5, options: [ { type: 'B' } ] } ]
    })
  })

  it('should take first instruction partially and second fully correctly', () => {
    const matcher = compile('([A][B]|[A])')
    const list = [ _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: [ { type: 'oneOf', step: 4, options: [ { type: 'B' } ] } ],
      groups: {}
    })
  })

  it('should take first instruction fully, despite second partially', () => {
    const matcher = compile('([A]|[A][B])')
    const list = [ _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should take first option and later fallback to second option', () => {
    const matcher = compile('([A]|[A][B])[C]')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })

  it('should handle alternative with empty (incorrect) left side', () => {
    const matcher = compile('(|[A][B])[C]')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })

  it('should handle alternative with empty (correct) left side', () => {
    const matcher = compile('(|[B])[A][B][C]')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })

  it('should handle alternative with empty (incorrect) right side', () => {
    const matcher = compile('([A][B]|)[C]')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })

  it('should handle alternative with empty (correct) right side', () => {
    const matcher = compile('([B]|)[A][B][C]')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })
})
