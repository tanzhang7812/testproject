import { Field, FunctionDef } from './index';
import { ExpressionValidator } from './expressionValidator';
import grammarText from './expression-grammar.pegjs';

export function validateExpression(expression: string, fields: Field[], functions: FunctionDef[]): { isValid: boolean; errors: string[] } {
  if (!expression.trim()) {
    return { isValid: true, errors: [] };
  }

  // 每次验证时创建新的 validator
  const validator = new ExpressionValidator(fields, functions, grammarText);
  return validator.validate(expression);
}
