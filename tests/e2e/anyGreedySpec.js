const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: AnyGreedy instruction', () => {
  it('should get all by single instruction with all objects', () => {
    const matcher = compile('[A]*')
    const list = [ _('A') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'A' } ] } ],
      groups: {}
    })
  })

  it('should allow no instructions', () => {
    const matcher = compile('[A]*')
    const list = []

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 0,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'A' } ] } ],
      groups: {}
    })
  })

  it('should allow no correct instructions', () => {
    const matcher = compile('[A]*')
    const list = [ _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 0,
      expectations: null,
      groups: {}
    })
  })

  it('should get all by single instruction (many times) with all objects', () => {
    const matcher = compile('[A]*')
    const list = $(10, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: [ { type: 'oneOf', step: 2, options: [ { type: 'A' } ] } ],
      groups: {}
    })
  })

  it('should get all by single instruction with not all objects', () => {
    const matcher = compile('[A]*')
    const list = [ _('A'), _('B') ]

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 1,
      expectations: null,
      groups: {}
    })
  })

  it('should get all by single instruction (many times) with not all objects', () => {
    const matcher = compile('[A]*')
    const list = $(10, [ _('A') ]).concat(_('B'))

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: null,
      groups: {}
    })
  })

  it('should fallback from single instruction', () => {
    const matcher = compile('[A]*[A]')
    const list = $(10, [ _('A') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 10,
      expectations: [
        // from [A]*
        { type: 'oneOf', step: 2, options: [ { type: 'A' } ] },
        // from [A]
        { type: 'oneOf', step: 3, options: [ { type: 'A' } ] }
      ],
      groups: {}
    })
  })

  it('should get partially by group instruction (many times)', () => {
    const matcher = compile('([A][B])*')
    const list = $(10, [ _('A'), _('B') ]).concat(_('A'))

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 20,
      expectations: [
        { type: 'oneOf', step: 4, options: [ { type: 'B' } ] }
      ],
      groups: {}
    })
  })

  it('should get (with fallback) by group instruction (many times)', () => {
    const matcher = compile('([A][B])*[A][B]')
    const list = $(10, [ _('A'), _('B') ])

    expect(matcher(list)).to.eql({
      finished: true,
      index: 0,
      length: 20,
      expectations: [
        // from [A]+
        { type: 'oneOf', step: 3, options: [ { type: 'A' } ] },
        // from [A][B] after
        { type: 'oneOf', step: 5, options: [ { type: 'A' } ] }
      ],
      groups: {}
    })
  })
})
