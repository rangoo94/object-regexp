const expect = require('expect.js')
const compile = require('../../lib/compileExpression')

describe('E2E: Detecting syntax errors', () => {
  it('should find unknown tokens', () => {
    const test = () => compile('~[A][B]')
    const test2 = () => compile('[A]#[B]')

    expect(test).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('Unknown token (line: 1, column: 1)')
    })

    expect(test2).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('Unknown token (line: 1, column: 4)')
    })
  })

  it('should find quantifiers without left-side', () => {
    const test = () => compile('+[A][B]')
    const test2 = () => compile('*[A][B]')
    const test3 = () => compile('?')

    expect(test).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('quantifier without left-side node (line: 1, column: 1)')
    })

    expect(test2).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('quantifier without left-side node (line: 1, column: 1)')
    })

    expect(test3).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('quantifier without left-side node (line: 1, column: 1)')
    })
  })

  it('should find quantifiers which can\'t be applied to left-side', () => {
    const test = () => compile('[A][B]+++')
    const test2 = () => compile('[A][B]{,3}++')

    expect(test).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('Unexpected quantifier (line: 1, column: 9)')
    })

    expect(test2).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('Unexpected quantifier (line: 1, column: 12)')
    })
  })

  it('should find group closing without group opening', () => {
    const test = () => compile('[A][B]++)+')

    expect(test).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('Unexpected group closing (line: 1, column: 9)')
    })
  })

  it('should allow NamedGroupStart only on beginning of group', () => {
    const test = () => compile('?<name>[xyz]')
    const test2 = () => compile('(?<name>[xyz])')
    const test3 = () => compile('([xyz]?<name>)')
    const test4 = () => compile('(?<name>?<xyz>[xyz])')

    expect(test).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('NamedGroupStart should be after group opening (line: 1, column: 1)')
    })

    expect(test2).to.not.throwError()

    expect(test3).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('NamedGroupStart should be after group opening (line: 1, column: 7)')
    })

    expect(test4).to.throwError(e => {
      e = e.toString()
      expect(e).to.contain('NamedGroupStart should be only after group opening (line: 1, column: 9)')
    })
  })
})
