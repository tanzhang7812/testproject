// 顶层表达式
Expression
  = _ expr:ExpressionElement _ { return expr; }

// 表达式元素
ExpressionElement
  = CaseExpression
  / BinaryExpression
  / CastFunction
  / FunctionCall
  / Field
  / StringLiteral
  / SignedNumber
  / NumberLiteral

// Case 表达式
CaseExpression
  = "case" _ 
    whens:WhenClause+ _
    elseClause:ElseClause? _
    "end"
    { return { 
        type: 'CaseExpression', 
        whens,
        else: elseClause 
      }; 
    }

// When 子句
WhenClause
  = "when" _ condition:ExpressionElement _ "then" _ result:ExpressionElement _
    { return { condition, result }; }

// Else 子句
ElseClause
  = "else" _ result:ExpressionElement _
    { return result; }

// Cast 函数
CastFunction
  = "cast" "(" _ value:Value _ "as" _ type:DataType _ ")"
    { return { type: 'CastFunction', value, targetType: type }; }

// 数据类型
DataType
  = "int"
  / "bigint"
  / "date"
  / "timestamp"
  / "double"
  / "decimal"
  / "float"
  / "string"
    { return text(); }

// 二元表达式
BinaryExpression
  = left:Term _ operator:Operator _ right:Term
    { return { type: 'BinaryExpression', operator: operator, left, right }; }

// 项
Term
  = CaseExpression
  / CastFunction
  / FunctionCall
  / Field
  / StringLiteral
  / SignedNumber
  / NumberLiteral

// 带符号数字
SignedNumber
  = "-" _ num:NumberLiteral
    { return { type: 'NumberLiteral', value: -num.value }; }

// 函数调用
FunctionCall
  = name:Identifier "(" _ args:ArgumentList? _ ")"
    { return { type: 'FunctionCall', name, arguments: args || [] }; }

// 参数列表
ArgumentList
  = head:Argument tail:(_ "," _ Argument)*
    { return [head].concat(tail.map(t => t[3])); }

// 单个参数
Argument
  = CaseExpression
  / BinaryExpression
  / CastFunction
  / FunctionCall
  / StringLiteral
  / SignedNumber
  / NumberLiteral
  / Field

// 字段引用
Field
  = name:Identifier
    { return { type: 'Field', name }; }

// 值
Value
  = CaseExpression
  / BinaryExpression
  / CastFunction
  / FunctionCall
  / Field
  / StringLiteral
  / SignedNumber
  / NumberLiteral

// 标识符（必须是有效的字段名或函数名）
Identifier "identifier"
  = name:[a-zA-Z_][a-zA-Z0-9_]*
    { return text(); }

// 字符串字面量
StringLiteral
  = "'" chars:[^']* "'"
    { return { type: 'StringLiteral', value: chars.join('') }; }
  / '"' chars:[^"]* '"'
    { return { type: 'StringLiteral', value: chars.join('') }; }

// 数字字面量
NumberLiteral
  = digits:[0-9]+ ("." [0-9]+)?
    { return { type: 'NumberLiteral', value: parseFloat(text()) }; }

// 操作符
Operator
  = op:(ArithmeticOperator / ComparisonOperator)
    { return op; }

// 算术操作符（只能用于数值类型）
ArithmeticOperator
  = op:(
      "+" /
      "-" /
      "*" /
      "/"
    )
    { return { type: 'ArithmeticOperator', value: op }; }

// 比较操作符
ComparisonOperator
  = op:(
      "<=" /
      ">=" /
      "<" /
      ">" /
      "="
    )
    { return { type: 'ComparisonOperator', value: op }; }

// 空白字符
_ "whitespace"
  = [ \t\n\r]* 