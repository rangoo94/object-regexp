const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode

describe('E2E: NegatedObject instruction', () => {
  it('should validate correct list against negated object instruction', () => {
    const matcher = compile('[^A]')
    const list = [ _('B'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should validate incorrect list against negated object instruction', () => {
    const matcher = compile('[^A]')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.be(null)
  })

  it('should validate empty list against negated object instruction', () => {
    const matcher = compile('[^A]')
    const list = []

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'notOneOf', step: 1, options: [ { type: 'A' } ] } ]
    })
  })

  it('should validate list not from start, against negated object instruction', () => {
    const matcher = compile('[^A]')
    const list1 = [ _('A'), _('B') ]
    const list2 = [ _('A'), _('A') ]

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
      expectations: [ { type: 'notOneOf', step: 1, options: [ { type: 'A' } ] } ]
    })
  })

  it('should validate list with 2 negated objects', () => {
    const matcher = compile('[^A][^B]')
    const list1 = [ _('B'), _('A') ]
    const list2 = [ _('B'), _('B') ]
    const list3 = [ _('B') ]
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
      expectations: [ { type: 'notOneOf', step: 2, options: [ { type: 'B' } ] } ]
    })

    expect(matcher(list4)).to.eql({
      finished: false,
      expectations: [ { type: 'notOneOf', step: 1, options: [ { type: 'A' } ] } ]
    })
  })

  it('should validate node with value', () => {
    const matcher = compile('[^A=xyz]')
    const list1 = [ _('A', 'abc') ]
    const list2 = [ _('A', 'xyz') ]

    expect(matcher(list1)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })

    expect(matcher(list2)).to.eql(null)
  })

  it('should validate negated object with two options', () => {
    const matcher = compile('[^A|B]')
    const list1 = [ _('A') ]
    const list2 = [ _('B') ]
    const list3 = [ _('C') ]

    expect(matcher(list1)).to.eql(null)
    expect(matcher(list2)).to.eql(null)

    expect(matcher(list3)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })
})
