const expect = require('expect.js')
const Node = require('../../lib/parser/Node')
const s = require('../../lib/parser/serializeExpression')

const _ = require('../utils').buildNode

const SIMPLE_OBJECT = new Node('Object', null, { options: [ { type: 'A' } ] })
const SIMPLE_VALUE_OBJECT = new Node('Object', null, { options: [ { type: 'A', value: 'x' } ] })
const MULTIPLE_OBJECT = new Node('Object', null, { options: [ { type: 'A' }, { type: 'B' } ] })
const MULTIPLE_VALUE_OBJECT = new Node('Object', null, { options: [ { type: 'A' }, { type: 'B', value: 'x' } ] })
const MULTIPLE_VALUE_OBJECT2 = new Node('Object', null, { options: [ { type: 'A', value: 'x' }, { type: 'B' } ] })

const SIMPLE_NOT_OBJECT = new Node('NegatedObject', null, { options: [ { type: 'A' } ] })
const SIMPLE_VALUE_NOT_OBJECT = new Node('NegatedObject', null, { options: [ { type: 'A', value: 'x' } ] })
const MULTIPLE_NOT_OBJECT = new Node('NegatedObject', null, { options: [ { type: 'A' }, { type: 'B' } ] })
const MULTIPLE_VALUE_NOT_OBJECT = new Node('NegatedObject', null, { options: [ { type: 'A' }, { type: 'B', value: 'x' } ] })
const MULTIPLE_VALUE_NOT_OBJECT2 = new Node('NegatedObject', null, { options: [ { type: 'A', value: 'x' }, { type: 'B' } ] })


describe('serializeExpression', () => {
  it('should serialize Object', () => {
    expect(s(SIMPLE_OBJECT)).to.eql('[A]')
    expect(s(SIMPLE_VALUE_OBJECT)).to.eql('[A=x]')
    expect(s(MULTIPLE_OBJECT)).to.eql('[A|B]')
    expect(s(MULTIPLE_VALUE_OBJECT)).to.eql('[A|B=x]')
    expect(s(MULTIPLE_VALUE_OBJECT2)).to.eql('[A=x|B]')
  })

  it('should serialize NegatedObject', () => {
    expect(s(SIMPLE_NOT_OBJECT)).to.eql('[^A]')
    expect(s(SIMPLE_VALUE_NOT_OBJECT)).to.eql('[^A=x]')
    expect(s(MULTIPLE_NOT_OBJECT)).to.eql('[^A|B]')
    expect(s(MULTIPLE_VALUE_NOT_OBJECT)).to.eql('[^A|B=x]')
    expect(s(MULTIPLE_VALUE_NOT_OBJECT2)).to.eql('[^A=x|B]')
  })

  it('should serialize AnyObject', () => {
    expect(s(new Node('AnyObject'))).to.eql('.')
  })

  it('should serialize EndIndex', () => {
    expect(s(new Node('EndIndex'))).to.eql('$')
  })

  it('should serialize Nothing', () => {
    expect(s(new Node('Nothing'))).to.eql('')
  })

  it('should ignore FinishNamedGroup', () => {
    expect(s(new Node('FinishNamedGroup'))).to.eql('')
  })

  it('should serialize Alternative', () => {
    expect(s(new Node('Alternative', [ SIMPLE_OBJECT, SIMPLE_VALUE_OBJECT ]))).to.eql('([A]|[A=x])')
    expect(s(new Node('Alternative', [ new Node('Nothing'), SIMPLE_VALUE_OBJECT ]))).to.eql('(|[A=x])')
  })

  it('should serialize Group', () => {
    expect(s(new Node('Group', [ SIMPLE_OBJECT, SIMPLE_VALUE_OBJECT ]))).to.eql('([A][A=x])')
  })

  it('should serialize AtomicGroup', () => {
    expect(s(new Node('AtomicGroup', [ SIMPLE_OBJECT, SIMPLE_VALUE_OBJECT ]))).to.eql('(?>[A][A=x])')
  })

  it('should serialize Root', () => {
    expect(s(new Node('Root', [ SIMPLE_OBJECT, SIMPLE_VALUE_OBJECT ]))).to.eql('[A][A=x]')
  })

  it('should serialize AmountAtMost', () => {
    expect(s(new Node('AmountAtMost', [ SIMPLE_OBJECT ], { value: 3 }))).to.eql('[A]{,3}')
  })

  it('should serialize AmountAtMostPossessive', () => {
    expect(s(new Node('AmountAtMostPossessive', [ SIMPLE_OBJECT ], { value: 3 }))).to.eql('[A]{,3}+')
  })

  it('should serialize AmountAtLeast', () => {
    expect(s(new Node('AmountAtLeast', [ SIMPLE_OBJECT ], { value: 3 }))).to.eql('[A]{3,}')
  })

  it('should serialize AmountAtLeastPossessive', () => {
    expect(s(new Node('AmountAtLeastPossessive', [ SIMPLE_OBJECT ], { value: 3 }))).to.eql('[A]{3,}+')
  })

  it('should serialize AmountBetween', () => {
    expect(s(new Node('AmountBetween', [ SIMPLE_OBJECT ], { from: 3, to: 5 }))).to.eql('[A]{3,5}')
  })

  it('should serialize AmountBetweenPossessive', () => {
    expect(s(new Node('AmountBetweenPossessive', [ SIMPLE_OBJECT ], { from: 3, to: 5 }))).to.eql('[A]{3,5}+')
  })

  it('should serialize AmountExact', () => {
    expect(s(new Node('AmountExact', [ SIMPLE_OBJECT ], { value: 5 }))).to.eql('[A]{5}')
  })

  it('should serialize AnyLazy', () => {
    expect(s(new Node('AnyLazy', [ SIMPLE_OBJECT ]))).to.eql('[A]*?')
  })

  it('should serialize AnyPossessive', () => {
    expect(s(new Node('AnyPossessive', [ SIMPLE_OBJECT ]))).to.eql('[A]*+')
  })

  it('should serialize AnyGreedy', () => {
    expect(s(new Node('AnyGreedy', [ SIMPLE_OBJECT ]))).to.eql('[A]*')
  })

  it('should serialize ManyLazy', () => {
    expect(s(new Node('ManyLazy', [ SIMPLE_OBJECT ]))).to.eql('[A]+?')
  })

  it('should serialize ManyPossessive', () => {
    expect(s(new Node('ManyPossessive', [ SIMPLE_OBJECT ]))).to.eql('[A]++')
  })

  it('should serialize ManyGreedy', () => {
    expect(s(new Node('ManyGreedy', [ SIMPLE_OBJECT ]))).to.eql('[A]+')
  })

  it('should serialize Optional', () => {
    expect(s(new Node('Optional', [ SIMPLE_OBJECT ]))).to.eql('[A]?')
  })

  it('should serialize OptionalPossessive', () => {
    expect(s(new Node('OptionalPossessive', [ SIMPLE_OBJECT ]))).to.eql('[A]?+')
  })

  it('should throw error on unknown node', () => {
    expect(() => s(new Node('Huh?'))).to.throwError()
  })
})
