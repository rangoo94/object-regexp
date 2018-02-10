const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode

describe('E2E: AnyObject instruction', () => {
  it('should validate correct list against any object instruction', () => {
    const matcher = compile('.')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should validate incorrect list against any object instruction', () => {
    const matcher = compile('.')
    const list = []

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'any', step: 1 } ]
    })
  })

  it('should validate list not from start, against any object instruction', () => {
    const matcher = compile('.')
    const list = [ _('B'), _('A') ]

    expect(matcher(list, 1)).to.eql({
      finished: true,
      index: 1,
      length: 1,
      expectations: null,
      groups: {}
    })

    expect(matcher(list, 2)).to.eql({
      finished: false,
      expectations: [ { type: 'any', step: 1 } ]
    })
  })

  it('should validate list with 2 any objects', () => {
    const matcher = compile('..')
    const list1 = [ _('A'), _('B') ]
    const list2 = [ _('A') ]
    const list3 = []

    expect(matcher(list1)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {}
    })

    expect(matcher(list2)).to.eql({
      finished: false,
      expectations: [ { type: 'any', step: 2 } ]
    })

    expect(matcher(list3)).to.eql({
      finished: false,
      expectations: [ { type: 'any', step: 1 } ]
    })
  })
})
