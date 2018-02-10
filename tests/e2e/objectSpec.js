const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode

describe('E2E: Object instruction', () => {
  it('should validate correct list against single object instruction', () => {
    const matcher = compile('[A]')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should validate incorrect list against single object instruction', () => {
    const matcher = compile('[A]')
    const list = [ _('B'), _('B') ]

    expect(matcher(list)).to.be(null)
  })

  it('should validate empty list against single object instruction', () => {
    const matcher = compile('[A]')
    const list = []

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 1, options: [ { type: 'A' } ] } ]
    })
  })

  it('should validate list not from start, against single object instruction', () => {
    const matcher = compile('[A]')
    const list1 = [ _('B'), _('A') ]
    const list2 = [ _('B'), _('B') ]

    expect(matcher(list1, 1)).to.eql({
      finished: true,
      index: 1,
      length: 1,
      expectations: null,
      groups: {}
    })

    expect(matcher(list2, 1)).to.eql(null)

    expect(matcher(list1, 2)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 1, options: [ { type: 'A' } ] } ]
    })
  })

  it('should validate list with 2 single nodes', () => {
    const matcher = compile('[A][B]')
    const list1 = [ _('A'), _('B') ]
    const list2 = [ _('A'), _('A') ]
    const list3 = [ _('A') ]
    const list4 = []

    expect(matcher(list1)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {}
    })

    expect(matcher(list2)).to.eql(null)

    expect(matcher(list3)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'B' } ] } ]
    })

    expect(matcher(list4)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 1, options: [ { type: 'A' } ] } ]
    })
  })

  it('should validate object with value', () => {
    const matcher = compile('[A=xyz]')
    const list1 = [ _('A', 'xyz') ]
    const list2 = [ _('A', 'abc') ]

    expect(matcher(list1)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })

    expect(matcher(list2)).to.eql(null)
  })

  it('should validate object with two options', () => {
    const matcher = compile('[A|B]')
    const list1 = [ _('A') ]
    const list2 = [ _('B') ]

    expect(matcher(list1)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })

    expect(matcher(list2)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })
})
