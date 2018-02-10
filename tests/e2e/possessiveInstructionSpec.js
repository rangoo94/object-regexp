const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

const _ = require('../utils').buildNode
const $ = require('../utils').repeatNodes

describe('E2E: Possessive instructions', () => {
  describe('ManyPossessive', () => {
    it('should handle correctly', () => {
      const matcher = compile('([A][B])++[A]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: [ { type: 'oneOf', step: 7, options: [ { type: 'B' } ] } ],
        groups: {}
      })
    })

    it('should handle correctly (2)', () => {
      const matcher = compile('([A][B])++[C]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('C') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: null,
        groups: {}
      })
    })

    it('should handle incorrectly', () => {
      const matcher = compile('([A][B])++[A][B]')
      const list = [ _('A'), _('B'), _('A'), _('B') ]

      // TODO: it could equal null as can't be finished ever
      expect(matcher(list)).to.eql({
        finished: false,
        expectations: [
          { type: 'oneOf', step: 6, options: [ { type: 'A' } ] },
          { type: 'oneOf', step: 8, options: [ { type: 'A' } ] }
        ]
      })
    })
  })

  describe('AnyPossessive', () => {
    it('should handle correctly', () => {
      const matcher = compile('([A][B])*+[A]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: [ { type: 'oneOf', step: 5, options: [ { type: 'B' } ] } ],
        groups: {}
      })
    })

    it('should handle correctly (2)', () => {
      const matcher = compile('([A][B])*+[C]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('C') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: null,
        groups: {}
      })
    })

    it('should handle incorrectly', () => {
      const matcher = compile('([A][B])*+[A][B]')
      const list = [ _('A'), _('B'), _('A'), _('B') ]

      // TODO: it could equal null as can't be finished ever
      expect(matcher(list)).to.eql({
        finished: false,
        expectations: [
          { type: 'oneOf', step: 4, options: [ { type: 'A' } ] },
          { type: 'oneOf', step: 6, options: [ { type: 'A' } ] }
        ]
      })
    })
  })

  describe('AmountAtLeastPossessive', () => {
    it('should handle correctly', () => {
      const matcher = compile('([A][B]){2,}+[A]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: [ { type: 'oneOf', step: 9, options: [ { type: 'B' } ] } ],
        groups: {}
      })
    })

    it('should handle correctly (2)', () => {
      const matcher = compile('([A][B]){2,}+[C]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('C') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: null,
        groups: {}
      })
    })

    it('should handle incorrectly', () => {
      const matcher = compile('([A][B]){2,}+[A][B]')
      const list = [ _('A'), _('B'), _('A'), _('B') ]

      // TODO: it could equal null as can't be finished ever
      expect(matcher(list)).to.eql({
        finished: false,
        expectations: [
          { type: 'oneOf', step: 8, options: [ { type: 'A' } ] },
          { type: 'oneOf', step: 10, options: [ { type: 'A' } ] }
        ]
      })
    })

    it('should handle partially', () => {
      const matcher = compile('([A][B]){3,}+[A]')
      const list = [ _('A'), _('B'), _('A'), _('B') ]

      expect(matcher(list)).to.eql({
        finished: false,
        expectations: [
          { type: 'oneOf', step: 6, options: [ { type: 'A' } ] }
        ]
      })
    })
  })

  describe('AmountBetweenPossessive', () => {
    it('should handle correctly', () => {
      const matcher = compile('([A][B]){2,5}+[A]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: [ { type: 'oneOf', step: 9, options: [ { type: 'B' } ] } ],
        groups: {}
      })
    })

    it('should handle correctly (2)', () => {
      const matcher = compile('([A][B]){2,}+[C]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('C') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: null,
        groups: {}
      })
    })

    it('should handle incorrectly', () => {
      const matcher = compile('([A][B]){3,}+[A][B]')
      const list = [ _('A'), _('B'), _('A'), _('B') ]

      // TODO: it could equal null as can't be finished ever
      expect(matcher(list)).to.eql({
        finished: false,
        expectations: [
          { type: 'oneOf', step: 6, options: [ { type: 'A' } ] }
        ]
      })
    })
  })

  describe('AmountAtMostPossessive', () => {
    it('should handle correctly', () => {
      const matcher = compile('([A][B]){,3}+[A]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: [ { type: 'oneOf', step: 5, options: [ { type: 'B' } ] } ],
        groups: {}
      })
    })

    it('should handle correctly (2)', () => {
      const matcher = compile('([A][B]){,3}+[C]')
      const list = [ _('A'), _('B'), _('A'), _('B'), _('C') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 5,
        expectations: null,
        groups: {}
      })
    })

    it('should handle incorrectly', () => {
      const matcher = compile('([A][B]){,2}+[A][B]')
      const list = [ _('A'), _('B'), _('A'), _('B') ]

      // TODO: it could equal null as can't be finished ever
      expect(matcher(list)).to.eql({
        finished: false,
        expectations: [
          { type: 'oneOf', step: 6, options: [ { type: 'A' } ] }
        ]
      })
    })
  })

  describe('OptionalPossessive', () => {
    it('should handle correctly', () => {
      const matcher = compile('([A])?+[A]')
      const list = [ _('A'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 2,
        expectations: null,
        groups: {}
      })
    })

    it('should handle correctly (2)', () => {
      const matcher = compile('[B]?+[A]')
      const list = [ _('A'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: true,
        index: 0,
        length: 1,
        expectations: null,
        groups: {}
      })
    })

    it('should handle incorrectly', () => {
      const matcher = compile('([A][B][A])?+[A]')
      const list = [ _('A'), _('B'), _('A') ]

      expect(matcher(list)).to.eql({
        finished: false,
        expectations: [
          { type: 'oneOf', step: 7, options: [ { type: 'A' } ] }
        ]
      })
    })
  })
})
