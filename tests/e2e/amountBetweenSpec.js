const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: AmountAtBetween instruction', () => {
  it('should take simple instruction correctly', () => {
    const matcher = compile('[A]{3,10}')
    const list = $(3, [ _('A') ])
    const list2 = $(9, [ _('A') ])
    const list3 = $(10, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: [ { type: 'oneOf', step: 5, options: [ { type: 'A' } ] } ],
      groups: {}
    })

    expect(matcher(list2)).to.eql({
      finished: true,
      index: 0,
      length: 9,
      expectations: [ { type: 'oneOf', step: 5, options: [ { type: 'A' } ] } ],
      groups: {}
    })

    expect(matcher(list3)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: null,
      groups: {}
    })
  })

  it('should take simple instruction incorrectly', () => {
    const matcher = compile('[A]{3,10}')
    const list = $(2, [ _('A') ])
    const list2 = $(1, [ _('A') ])
    const list3 = $(0, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 3, options: [ { type: 'A' } ] } ]
    })

    expect(matcher(list2)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'A' } ] } ]
    })

    expect(matcher(list3)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 1, options: [ { type: 'A' } ] } ]
    })
  })

  it('should match between correctly (after)', () => {
    const matcher = compile('[A]{3,10}')
    const list = $(20, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: null,
      groups: {}
    })
  })

  it('should match between incorrectly', () => {
    const matcher = compile('[A]{3,10}')
    const list = $(20, [ _('B') ])

    expect(matcher(list)).to.eql(null)
  })

  it('should match between correctly with fallback', () => {
    const matcher = compile('[A]{3,10}[A]')
    const list = $(10, [ _('A') ])
    const list2 = $(6, [ _('A') ])
    const list3 = $(4, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: [ { type: 'oneOf', step: 6, options: [ { type: 'A' } ] } ],
      groups: {}
    })

    expect(matcher(list2)).to.eql({
      finished: true,
      index: 0,
      length: 6,
      expectations: [
        { type: 'oneOf', step: 5, options: [ { type: 'A' } ] },
        { type: 'oneOf', step: 6, options: [ { type: 'A' } ] }
      ],
      groups: {}
    })

    expect(matcher(list3)).to.eql({
      finished: true,
      index: 0,
      length: 4,
      expectations: [
        { type: 'oneOf', step: 5, options: [ { type: 'A' } ] },
        { type: 'oneOf', step: 6, options: [ { type: 'A' } ] }
      ],
      groups: {}
    })
  })

  it('should match between incorrectly with fallback', () => {
    const matcher = compile('[A]{3,10}[A]')
    const list = $(3, [ _('A') ])
    const list2 = $(3, [ _('B'), _('A') ])
    const list3 = $(3, [ _('A'), _('B') ])

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [
        { type: 'oneOf', step: 5, options: [ { type: 'A' } ] },
        { type: 'oneOf', step: 6, options: [ { type: 'A' } ] }
      ]
    })

    expect(matcher(list2)).to.eql(null)
    expect(matcher(list3)).to.eql(null)
  })
})
