# Regular Expressions for Objects

[![Travis](https://travis-ci.org/rangoo94/object-regexp.svg)](https://travis-ci.org/rangoo94/object-regexp)
[![Code Climate](https://codeclimate.com/github/rangoo94/object-regexp/badges/gpa.svg)](https://codeclimate.com/github/rangoo94/object-regexp)
[![Coverage Status](https://coveralls.io/repos/github/rangoo94/object-regexp/badge.svg?branch=master)](https://coveralls.io/github/rangoo94/object-regexp?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/object-regexp.svg)](https://www.npmjs.com/package/object-regexp)

It handles syntax similar expressions to regexp, to search within array of objects.

## What is it useful for?

Most important use case for this package is to use it in parsers,
as it can help build syntax tree out of tokens, with simple and known syntax.

Also, because of this case it is **very efficient, result optimizations here are done even on `0.000001ms` level (`1e-6ms` or `1e-3μs`)**.
Works best on newest V8 engines.

## Optimizations put into

As this library is working in such speed, there is a lot of optimizations put inside, i.e.:

- **Hidden classes optimizations**
  keeping proper order (and types) of both initialized and mutated properties
- **Only fast constructions**
  `else`/`else if` are too slow on this level of optimization
- **Better typing**
  Some instructions are build using `eval` to allow JS engine to work faster on them
- **Less context switch**
  Accessing different contexts is always slow, calling functions most of time, causing a lot of `ContextifyScript::New` events
- **Optimizing inline caches**
  Make less options for JS engine which it have to cover, by using same types and separating these which have differences
- ...many, many others.

## How to install

Package is available as `object-regexp` in NPM, so you can use it in your project using
`npm install object-regexp` or `yarn add object-regexp`

## What are requirements?

Code itself is written in ES6 and should work in Node.js 6+ environment (best in Node.js 9+).
If you would like to use it in browser or older development, there is also transpiled and bundled (UMD) version included.
You can use `object-regexp/browser` in your requires or `ObjectRegexp` in global environment (in browser):

```js
// Load library
const ObjectRegexp = require('object-regexp/browser')

const expression = '[ReservedWord][Space]+[Variable]'
const process = ObjectRegexp.compile(expression)

const objects = [ { type: 'ReservedWord' } ]

console.log(process(objects))
```

## What is proper input for library?

Most importantly, it should be array of objects. If you would like to use syntax like `[ObjectType]`,
these objects should have `type` property. Additionally, if you would like to match by value (`ObjectType=value]`),
library is matching that value against `object.data.value`. Example input:

```js
const input = [
  { name: 'ReservedWord', data: { value: 'declare' } },
  { name: 'Space' },
  { name: 'Space' },
  { name: 'NewLine' },
  { name: 'Variable' }
]
```

## How does syntax look?

Syntax is very similar to regular expressions, i.e.:

```js
[ReservedWord=declare][Space|NewLine]+([Variable]|[Number][Unit])
```

which could much previous input.

### Possible syntax options

#### Object types

You can match against `type` property in objects using `[Type]` syntax, example:

```js
const input = [ { type: 'Rule' } ]
const matchingExpression = '[Rule]'
```

Also, using `[Type=value]` format you can match against `data.value` property:

```js
const input = [ { type: 'Rule', data: { value: 'abrakadabra' } } ]
const matchingExpression = '[Rule=abrakadabra]'
```

There is also a way to simplify alternative, using `|` character inside:

```js
const input = [ { type: 'Rule', data: { value: 'abrakadabra' } } ]
const matchingExpression = '[Rule=abrakadabra|Anything|Else=xyz]'
```

Rule above will match any object which is either `Rule=abrakadabra`, `Anything` or `Else=xyz`.

#### Negated object types

You can match also objects which are NOT as specified, similar way to regular expressions:

```js
const input = [ { type: 'Rule' } ]
const matchingExpression = '[^Something]'
```

It will match any object which has type different than `Something`. Same as in basic object types,
you can check value:

```js
const input = [ { type: 'Rule', data: { value: 'regexp' } } ]
const matchingExpression = '[^Rule=abrakadabra]'
```

This expression will match input, as it has different value.

Similar (but more importantly) to basic object types, you can combine few types:

```js
const input = [ { type: 'Rule', data: { value: 'regexp' } } ]
const matchingExpression = '[^Rule=abrakadabra|Anything|Else=xyz]'
```

This rule will match everything that is NOT any of these rules (instead of using OR it uses AND).

#### Any object

Using `.` you can match any object:

```js
const input = [ { type: 'Rule', data: { value: 'regexp' } }, { type: 'Rule', data: { value: 'regexp' } } ]
const matchingExpression = '..' // expects 2 objects, no matter what is inside
```

#### Alternatives

You can match with simple alternatives using `|` sign.
Everything in current block which is on left side will be first option, everything on right - second.

Examples:

```js
const input = [ { type: 'Rule', data: { value: 'regexp' } } ]

const expression1 = '[Rule]|[Rule2]' // will match object which is `Rule` or `Rule2`
const expression2 = '[Rule]|[Rule2][Rule3]' // will match either `[Rule]` or `[Rule2][Rule3]`
const expression3 = '[Rule]|[^Rule4]' // will firstly try to match `[Rule]`, otherwise `[^Rule4]`
const expression4 = '[Rule]|[Rule2]|[^Rule4]' // you can nest them as well
```

#### Optionals

Optionals are simple alternatives, either will be found or not. You should use `?` sign for that:

```js
const input = [ { type: 'Rule', data: { value: 'regexp' } } ]
const matchingExpression = '[OtherRule]?' // it will match, as this `OtherRule` may or may not be.
```

#### Groups

You can define groups. Simple groups are not captured, but can be used to apply rule above:

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]
const matchingExpression = '([Rule][Rule][Rule])?' // optional will check for 3 objects
```

Also, if you would like to get content from inside you can use named groups:

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]

// Optional will check for 3 objects, and as result you will get information about them
const matchingExpression = '(?<name>[Rule][Rule][Rule])?'
```

#### Expected number of occurrences

Similar to regexp, we've got four ways to describe expected number of occurrences:

##### At least N objects

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]

// It will match at least 2 objects, but catch as many as it can (this time it's 3)
const matchingExpression = '[Rule]{2,}'
```

##### Maximum N objects

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]

// It will match at most 5 objects, but will allow smaller number of objects
const matchingExpression = '[Rule]{,5}'
```

##### Amount between

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]

// It will match between 2 and 5 objects, trying to catch as much as it can
const matchingExpression = '[Rule]{2,5}'
```

##### Exact amount

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]

// It will match only 3 objects, it's equivalent of [Rule][Rule][Rule]
const matchingExpression = '[Rule]{3}'
```

#### "Any" quantifier

We've got - same as in regular expressions - "Any" quantifier which is represented by `*`.
It is searching for as many objects it can, but it will accept no objects as well.

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]

// It will match as many objects as it can, this time 3
const matchingExpression = '[Rule]*'

// It will match as many objects as it can, this time 0
const matchingExpression = '[UnknownRule]*'
```

This is greedy quantifier, if you would like to use lazy quantifier you can use `*?`.
Difference between is that **lazy (*?)** quantifier will try to gather as less as it can,
when **greedy (*)** will try to get as many as it can:

```js
const input = [ { type: 'Rule' } ]
const matchingExpression = '[Rule]*?' // It will catch nothing

const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'AnotherRule' } ]

// This time it will catch two `[Rule]` objects, to satisfy root expression (finding `AnotherRule` later).
const matchingExpression = '[Rule]*?[AnotherRule]'
```

#### "Many" quantifier

There is also "Many" quantifier (`+`) which is very similar to "Any".
Only difference is that it will fail if no objects found.

```js
const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'Rule' } ]

// It will match as many objects as it can, this time 3
const matchingExpression = '[Rule]+'

// It will not match :(
const notMatchingExpression = '[UnknownRule]+'
```

There is also lazy version:

```js
const input = [ { type: 'Rule' }, { type: 'Rule' } ]

// It will catch single `Rule`, as it's smallest amount it can accept
const matchingExpression = '[Rule]+?'

const input = [ { type: 'Rule' }, { type: 'Rule' }, { type: 'AnotherRule' } ]

// It will catch two `[Rule]` objects, to satisfy root expression (finding `AnotherRule` later).
const matchingExpression = '[Rule]+?[AnotherRule]'
```

#### Atomic groups

If you would like regular expression to work faster, you can think about atomic groups (and possessive quantifiers).
These groups, after will be finished will remove it's save points - you can't recover for them.

See example:

```js
const rules = [ { type: 'A' }, { type: 'A' }, { type: 'A' } ]

// It will get all A's to first quantifier ([A]+), but when it will try to get ending A,
// it will recover to [A]+ with 2 elements (as no other A's left).
// So, because of recovering, this expression will MATCH rules above.
const matchingExpression = '[A]+[A]'

// It will get all A's to first quantifier. It will satisfy atomic group,
// but nothing will be left for ending [A], so expression will fail.
const failingExpression = '(?>[A]+)[A])'
```

You can pass any number of sub-instructions to atomic groups.

#### Possessive quantifiers

There are simpler instructions for stuff like `(?>[A]+)`, which are possessive quantifiers.
You can make `?`, `+`, `*` possessive, using `+` sign, in sequence: `?+`, `++`, `*+`.
It will be equivalent of `(?>[A]?)`, `(?>[A]+)` and `(?>[A}*)`.

Also, you can make it for `Amount at least`, `Amount at most` and `Amount between` quantifiers,
just adding `+` sign after.

#### Start and end index

In regular expressions there are common used `^` and `$` signs matching beginning and end of string.

For performance reasons we don't have (yet?) starting index (`^`), but we have `$` sign.

If you would like to search from different index (than beginning),
look at **"Searching from different index than beginning"** chapter.

Example:

```js
const rules = [ { type: 'A' }, { type: 'A' }, { type: 'A' } ]
const matchingExpression = '[A][A]'
const matchingExpression2 = '[A][A][A]$'
const notMatchingExpression = '[A][A]$'
```

#### Missing parts of syntax

There are most important things for parsing, but still we are missing some features out of regular expressions:

- Beginning index (`^`)
- Negative and positive lookaheads (`?!` and `?=`)

### How to use it

Most importantly `object-regexp` package is exporting `compile` and `toCode` methods.

```js
const compile = require('object-regexp').compile
const toCode = require('object-regexp').toCode

const expression = '[Space]+'
const match = compile(expression)

const objects = [ { type: 'Space' }, { type: 'Space' }, { type: 'Space' } ]

// Match dynamic expressions
console.log(match(objects))

// Save standalone code of expression
require('fs').writeFileSync('expression.js', 'module.exports = ' + toCode(expression))
```

Format of success result:

```js
const result = {
  finished: true, // This expression is fully finished
  index: 0, // beginning index for searching
  length: 10, // number of objects which are matching this expression
  expectations: [
    // even succeeded expression can be continued,
    // so sometimes you may want expectations to extend it
    { type: 'oneOf' step: 1, options: [ { type: 'Space' }, { type: 'NewLine' } ] },
    { type: 'notOneOf', step: 4, options: [ { type: 'Space' }, { type: 'NewLine' } ] },
    { type: 'any', step: 10 }
  ],
  groups: {
    group1: { from: 0, to: 3 } // objects for named group `group1` found between 0 and 3 indexes
  }
}
```

When there is no way to continue this expression, `expectations` will be `null`.

Format of failed result which **CAN'T** be continued:

```js
null
```

It's just always `null`.

Format of failed result which **CAN** be continued with some objects:

```js
const failedResult = {
  finished: false,
  expectations: [
    { type: 'oneOf', step: 1, options: [ { type: 'Space' }, { type: 'NewLine' } ] },
    { type: 'notOneOf', step: 5, options: [ { type: 'Space' }, { type: 'NewLine' } ] },
    { type: 'any', step: 3 }
  ]
}
```

As you can see, failed result can return some expectations.
If you passed all objects you have, it means that it failed.
Otherwise, if you are adding them one by one,
it says what should be in next object to allow continuing on this expression.

Example:

```js
const compile = require('object-regexp').compile

const expression = '[Space]+[Literal]'
const match = compile(expression)

const objects = [ { type: 'Space' }, { type: 'Space' } ]

console.log(match(objects))

/*
{
  expectations: [
    { type: 'oneOf', step: 3, options: [ { type: 'Space' } ] },
    { type: 'oneOf', step: 4, options: [ { type: 'Literal' } ] }
  ]
*/
```

As you can see this expression couldn't be finished, because of lack of `Literal`.
This engine assumes, that you may send something more to satisfy matcher.
In this case, you can either send `Space` object (and later again `Space` or `Literal`)
or `Literal` object to finish expression.

It's mostly important if you will try to parse one by one, with some rules what objects can be included in some place.

- `oneOf` is equivalent of missing `[Type]` rule
- `notOneOf` is equivalent of missing `[^Type]` rule
- `any` means that it can be any object

Summing up, to check if expression has succeed, you have to check:

```js
// ...

const result = match(objects)
const succeed = result && result.finished
```

### Macros

Additionally, to make life simpler there is created a way to pass macros for expression.
It's very useful when you are making a lot of rules, and you would prefer, i.e.

```
@for (var:$var) #from (from:$value) (how:#to|#through) (end:$value)
```

over

```
[AtRule=for][Space|NewLine]+(?<var>[Variable])[Space|NewLine]+[Literal=from][Space|NewLine]+(?<from>[String|Variable|Number])[Space|NewLine]+(?<how>[Literal=to|Literal=through])[Space|NewLine]+(?<end>[String|Variable|Number])
```

syntax.

Macros have pretty simple format:

```js
const macros = [
  {
    // You can use named groups, and apply them to result
    // Also, $0, $1, $2... works for captured groups
    from: '@(?<name>\\w+)'
    to: '[AtRule=$name]'
  },
  {
    // 'from' is regular expression,
    // so you have to escape every reserved sign you want to use literally
    from: '\\$var',
    to: '[Variable]'
  },
  {
    from: '\\$value',
    to: '[String|Variable|Number]'
  },
  {
    from: ' ',
    to: '[Space|NewLine]+'
  },
  {
    // It is replacing expression before parsing, so you can event change syntax a little:
    from: '\\((?<name>[a-zA-Z]+):',
    to: '(?<$name>'
  },
  {
    from: '#(?<name>[a-zA-Z]+)',
    to: '[Literal=$name]'
  }
]
```

To apply macros to expression, you have to use second parameter of compile method:

```js
const compile = require('object-regexp').compile

const expression = '(?<spacing>[Space]+)[Literal]'
const macros = [ /* ... */ ]
const match = compile(expression, macros)

const objects = [ { type: 'Space' }, { type: 'Space' } ]

console.log(match(objects))
```

### Searching from different index than beginning

You don't have to search from beginning of list, there is also `startIndex` parameter:

```js
const compile = require('object-regexp').compile

const expression = '(?<spacing>[Space]+)[Literal]'
const macros = [ /* ... */ ]
const match = compile(expression, macros)

const objects = [ { type: 'X' }, { type: 'Space' }, { type: 'Space' } ]

console.log(match(objects, 1))
```

### Beautify code parameter

By default there is no indentation preserved when you are generating your matching code.

If you would like to beautify this code,
you can pass third parameter to `toCode` function:

```js
const toCode = require('object-regexp').toCode

const expression = '(?<spacing>[Space]+)[Literal]'
const code = toCode(expression, null, true)
```

> **Remember:**
>
> FOR BETTER PERFORMANCE DO NOT EDIT THESE FILES (UGLIFY AT MOST).
> EVEN REDUNDANT `ok = true` IS THERE TO MAKE IT FASTER.

## Changelog

### Version 2

- **2.0.0** - inline all instructions, add optimizations (2-100x faster than v1), write tests

### Version 1

- **1.3.6** - optimize a lot, mostly groups and possessive instructions
- **1.3.5** - fix `walkBackEnd` traverser to always go from end
- **1.3.4** - added `startIndex` parameter for processing functions
- **1.3.3** - fix serialization function (add missing node types)
- **1.3.2** - optimize last atomic instructions (on the end of `Root` or `AtomicGroup`)
- **1.3.1** - added end index sign (`$`)
- **1.3.0** - add possessive quantifiers and atomic groups
- **1.2.1** - add missing `universal-lexer` dependency
- **1.2.0** - return `expectations` even if expression succeed
- **1.1.6** - fix critical problem with `Many Lazy` and `Any Lazy` formulas
- **1.1.5** - fix critical problem with `Any Object` formula
- **1.1.4** - just rebuild broken NPM package
- **1.1.3** - optimize going between nodes while processing instruction (works up to 2x faster)
- **1.1.2** - fix problems with `Nothing` rule
- **1.1.1** - optimize simple instructions (works 2-3x faster)
- **1.1.0** - fix problem with `Many Lazy` and `Any Lazy`, add documentation to processing function
- **1.0.2** - add information about `Exact amount` quantifier
- **1.0.1** - small fixes for README file
