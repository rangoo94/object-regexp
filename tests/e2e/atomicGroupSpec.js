const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: AtomicGroup instruction', () => {
  it('should treat simple AtomicGroup correctly', () => {
    const matcher = compile('(?>[A][B][C])')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })

  it('should not fallback when atomic group is finished', () => {
    const matcher = compile('(?>[A][B]+)[B]')
    const list = [ _('A') ].concat($(10, _('B')))
    const list2 = [ _('A') ].concat($(10, _('B'))).concat(_('C'))

    // TODO: Actually, it could return null, as it never can be finished
    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [
        { type: 'oneOf', step: 5, options: [ { type: 'B' } ] },
        { type: 'oneOf', step: 6, options: [ { type: 'B' } ] }
      ]
    })

    expect(matcher(list2)).to.eql(null)
  })

  it('should not fallback when atomic group is finished (alternative)', () => {
    const matcher = compile('(?>([A][B]|[A]))[B]')
    const list = [ _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql(null)
  })

  it('should fallback inside atomic group correctly', () => {
    const matcher = compile('(?>([A][B])+[C])[B]')
    const list = $(10, [ _('A'), _('B') ]).concat([ _('C'), _('B') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 22,
      expectations: null,
      groups: {}
    })
  })

  it('should fallback inside atomic group correctly (possessive)', () => {
    const matcher = compile('(?>([A][B])+[A])[B]')
    const list = $(10, [ _('A'), _('B') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 20,
      expectations: [
        { type: 'oneOf', step: 6, options: [ { type: 'A' } ] },
        { type: 'oneOf', step: 8, options: [ { type: 'A' } ] }
      ],
      groups: {}
    })
  })
})
