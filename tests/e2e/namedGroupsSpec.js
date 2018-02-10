const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: Named group instruction', () => {
  it('should match single value group correctly', () => {
    const matcher = compile('(?<name>[A])')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {
        name: { from: 0, to: 1 }
      }
    })
  })

  it('should match single value group correctly on end', () => {
    const matcher = compile('[A](?<name>[B])')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {
        name: { from: 1, to: 2 }
      }
    })
  })

  it('should match single value group correctly on center', () => {
    const matcher = compile('[A](?<name>[B])[C]')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {
        name: { from: 1, to: 2 }
      }
    })
  })

  it('should match group with many values', () => {
    const matcher = compile('[A](?<name>[B][C])')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {
        name: { from: 1, to: 3 }
      }
    })
  })

  it('should match group with ManyGreedy', () => {
    const matcher = compile('[A](?<name>([B][C])+)[D]')
    const list = [ _('A') ].concat($(10, [ _('B'), _('C') ])).concat(_('D'))

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 22,
      expectations: null,
      groups: {
        name: { from: 1, to: 21 }
      }
    })
  })

  it('should match many groups', () => {
    const matcher = compile('[A](?<name>[B][C])(?<other>[D])')
    const list = [ _('A'), _('B'), _('C'), _('D') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 4,
      expectations: null,
      groups: {
        name: { from: 1, to: 3 },
        other: { from: 3, to: 4 }
      }
    })
  })

  it('should match groups correctly with fallback', () => {
    const matcher = compile('(?<name>[A])(?<value>([B][C])+)(?<other>[B][C])')
    const list = [ _('A') ].concat($(10, [ _('B'), _('C') ]))

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 21,
      expectations: [
        { type: 'oneOf', step: 9, options: [ { type: 'B' } ] },
        { type: 'oneOf', step: 13, options: [ { type: 'B' } ] }
      ],
      groups: {
        name: { from: 0, to: 1 },
        value: { from: 1, to: 19 },
        other: { from: 19, to: 21 }
      }
    })
  })

  it('should match groups correctly with alternative fallback', () => {
    const matcher = compile('((?<x>[A])|(?<y>[A][B]))(?<z>[C])')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {
        x: undefined,
        y: { from: 0, to: 2 },
        z: { from: 2, to: 3 }
      }
    })
  })
})
