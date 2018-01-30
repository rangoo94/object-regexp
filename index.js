const compile = require('./lib/compileExpression')
const toSyntaxTree = require('./lib/parser/parseExpressionToSyntaxTree')
const serialize = require('./lib/parser/serializeExpression')

exports.compile = compile
exports.toSyntaxTree = toSyntaxTree
exports.serializeSyntaxTree = serialize
