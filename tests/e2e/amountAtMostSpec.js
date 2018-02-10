const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: AmountAtMost instruction', () => {
  it('should take simple instruction correctly', () => {
    const matcher = compile('[A]{,10}')
    const list = $(9, [ _('A') ])
    const list2 = $(10, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 9,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'A' } ] } ],
      groups: {}
    })

    expect(matcher(list2)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: null,
      groups: {}
    })
  })

  it('should allow empty list', () => {
    const matcher = compile('[A]{,10}')
    const list = []

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 0,
      expectations: [
        { type: 'oneOf', step: 2, options: [ { type: 'A' } ] }
      ],
      groups: {}
    })
  })

  it('should take simple instruction with next elements correctly', () => {
    const matcher = compile('[A]{,10}')
    const list = $(8, [ _('A') ]).concat(_('B'))

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 8,
      expectations: null,
      groups: {}
    })
  })

  it('should take simple incorrect instruction', () => {
    const matcher = compile('[A]{,10}[B]')
    const list = $(11, [ _('A') ]).concat(_('B'))

    expect(matcher(list)).to.eql(null)
  })

  it('should take extended instruction correctly', () => {
    const matcher = compile('([A][B]){,100}')
    const list = $(100, [ _('A'), _('B') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 200,
      expectations: null,
      groups: {}
    })
  })

  it('should take extended instruction incorrectly', () => {
    const matcher = compile('([A][B]){,100}')
    const list = $(100, [ _('C'), _('D') ])
    const list2 = $(100, [ _('A'), _('C') ])

    const result = {
      finished: true,
      index: 0,
      length: 0,
      expectations: null,
      groups: {}
    }

    expect(matcher(list)).to.eql(result)
    expect(matcher(list2)).to.eql(result)
  })

  it('should take extended instruction partially', () => {
    const matcher = compile('([A][B]){,100}')
    const list = $(90, [ _('A'), _('B') ])
    const list2 = $(90, [ _('A'), _('B') ]).concat(_('A'))

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 180,
      expectations: [ { type: 'oneOf', step: 3, options: [ { type: 'A' } ] } ],
      groups: {}
    })

    expect(matcher(list2)).to.eql({
      finished: true,
      index: 0,
      length: 180,
      expectations: [ { type: 'oneOf', step: 4, options: [ { type: 'B' } ] } ],
      groups: {}
    })
  })

  it('should take fallback', () => {
    const matcher = compile('([A][B]){,60}[A][B]')
    const list = $(50, [ _('A'), _('B') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 100,
      expectations: [
        { type: 'oneOf', step: 3, options: [ { type: 'A' } ] },
        { type: 'oneOf', step: 5, options: [ { type: 'A' } ] }
      ],
      groups: {}
    })
  })
})
