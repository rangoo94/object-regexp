const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: AmountAtLeast instruction', () => {
  it('should take simple instruction correctly', () => {
    const matcher = compile('[A]{10,}')
    const list = $(10, [ _('A') ])
    const list2 = $(11, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: [ { type: 'oneOf', step: 12, options: [ { type: 'A' } ] } ],
      groups: {}
    })

    expect(matcher(list2)).to.eql({
      finished: true,
      index: 0,
      length: 11,
      expectations: [ { type: 'oneOf', step: 12, options: [ { type: 'A' } ] } ],
      groups: {}
    })
  })

  it('should take simple instruction with next elements correctly', () => {
    const matcher = compile('[A]{10,}')
    const list = $(12, [ _('A') ]).concat(_('B'))

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 12,
      expectations: null,
      groups: {}
    })
  })

  it('should take simple incorrect instruction', () => {
    const matcher = compile('[A]{10,}')
    const list = $(9, [ _('A') ]).concat(_('B'))

    expect(matcher(list)).to.eql(null)
  })

  it('should take partially correct simple instruction', () => {
    const matcher = compile('[A]{10,}')
    const list = $(9, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 10, options: [ { type: 'A' } ] } ]
    })
  })

  it('should take partially correct long instruction', () => {
    const matcher = compile('[A]{100,}')
    const list = $(90, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'A' } ] } ]
    })
  })

  it('should take extended instruction correctly', () => {
    const matcher = compile('([A][B]){100,}')
    const list = $(100, [ _('A'), _('B') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 200,
      expectations: [ { type: 'oneOf', step: 7, options: [ { type: 'A' } ] } ],
      groups: {}
    })
  })

  it('should take extended instruction incorrectly', () => {
    const matcher = compile('([A][B]){100,}')
    const list = $(100, [ _('C'), _('D') ])
    const list2 = $(100, [ _('A'), _('C') ])

    expect(matcher(list)).to.eql(null)
    expect(matcher(list2)).to.eql(null)
  })

  it('should take extended instruction partially', () => {
    const matcher = compile('([A][B]){100,}')
    const list = $(90, [ _('A'), _('B') ])
    const list2 = $(90, [ _('A'), _('B') ]).concat(_('A'))

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 3, options: [ { type: 'A' } ] } ]
    })

    expect(matcher(list2)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 4, options: [ { type: 'B' } ] } ]
    })
  })
})
