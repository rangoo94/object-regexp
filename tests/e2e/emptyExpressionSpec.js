const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode

describe('E2E: Empty expression', () => {
  it('should return valid response with empty list', () => {
    const matcher = compile('')
    const list = []

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 0,
      expectations: null,
      groups: {}
    })
  })

  it('should return valid response with populated list', () => {
    const matcher = compile('')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 0,
      expectations: null,
      groups: {}
    })
  })

  it('should correct data from different index', () => {
    const matcher = compile('')
    const list = [ _('A'), _('B') ]

    expect(matcher(list, 1)).to.eql({
      finished: true,
      index: 1,
      length: 0,
      expectations: null,
      groups: {}
    })
  })
})
