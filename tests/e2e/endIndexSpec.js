const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode

describe('E2E: EndIndex instruction', () => {
  it('should take instructions correctly', () => {
    const matcher = compile('[A][B]$')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {}
    })
  })

  it('should take incorrect instructions', () => {
    const matcher = compile('[A]$')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql(null)
  })
})
