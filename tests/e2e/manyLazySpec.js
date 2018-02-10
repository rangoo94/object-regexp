const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: ManyLazy instruction', () => {
  it('should find single occurrence of single node', () => {
    const matcher = compile('[A]+?')
    const list = [ _('A'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should find single occurrence of group node', () => {
    const matcher = compile('([A][B])+?')
    const list = [ _('A'), _('B'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {}
    })
  })

  it('should match partially no occurrences of single node', () => {
    const matcher = compile('[A]+?')
    const list = []

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'A' } ] } ]
    })
  })

  it('should match partially no occurrences of group node', () => {
    const matcher = compile('([A][B])+?')
    const list = []

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [ { type: 'oneOf', step: 3, options: [ { type: 'A' } ] } ]
    })
  })

  it('should disallow no occurrences of single node', () => {
    const matcher = compile('[A]+?')
    const list = [ _('B') ]

    expect(matcher(list)).to.eql(null)
  })

  it('should disallow no occurrences of group node', () => {
    const matcher = compile('([A][B])+?')
    const list = [ _('B') ]

    expect(matcher(list)).to.eql(null)
  })

  it('should find single occurrence of single node with something after', () => {
    const matcher = compile('[A]+?[A]')
    const list = [ _('A'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 2,
      expectations: null,
      groups: {}
    })
  })

  it('should find single occurrence of group node with something after', () => {
    const matcher = compile('([A][B])+?[A]')
    const list = [ _('A'), _('B'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 3,
      expectations: null,
      groups: {}
    })
  })

  it('should fall back like ManyGreedy (single) with something after', () => {
    const matcher = compile('[A]+?[C]')
    const list = [ _('A'), _('A'), _('A'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 4,
      expectations: null,
      groups: {}
    })
  })

  it('should fall back like ManyGreedy (group) with something after', () => {
    const matcher = compile('([A][B])+?[C]')
    const list = [ _('A'), _('B'), _('A'), _('B'), _('A'), _('B'), _('C') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 7,
      expectations: null,
      groups: {}
    })
  })

  it('should fail fallbacking with something after', () => {
    const matcher = compile('[A]+?[C]')
    const list = [ _('A'), _('A'), _('A'), _('D') ]

    expect(matcher(list)).to.eql(null)
  })

  it('should find correct expectation if missing something after', () => {
    const matcher = compile('[A]+?[C]')
    const list = [ _('A'), _('A'), _('A') ]

    expect(matcher(list)).to.eql({
      finished: false,
      expectations: [
        { type: 'oneOf', step: 3, options: [ { type: 'A' } ] },
        { type: 'oneOf', step: 4, options: [ { type: 'C' } ] }
      ]
    })
  })
})
