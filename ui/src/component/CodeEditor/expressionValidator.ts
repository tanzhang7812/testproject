import * as peg from 'pegjs';
import { Field, FunctionDef } from './index';

export class ExpressionValidator {
  private parser: peg.Parser;
  private fields: Field[];
  private functions: FunctionDef[];
  private numericTypes = ['number', 'int', 'byte', 'short', 'long', 'double', 'decimal', 'float'];

  constructor(fields: Field[], functions: FunctionDef[], grammar: string) {
    this.parser = peg.generate(grammar);
    this.fields = fields;
    this.functions = functions;
  }

  validate(expression: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    try {
      // 解析表达式
      const ast = this.parser.parse(expression);
      // 验证AST
      this.validateNode(ast, errors);
      return { isValid: errors.length === 0, errors };
    } catch (e) {
      if (e instanceof Error) {
        errors.push(e.message);
      }
      return { isValid: false, errors };
    }
  }

  private validateNode(node: any, errors: string[]): void {
    if (!node) return;

    switch (node.type) {
      case 'Field':
        this.validateField(node, errors);
        break;
      case 'FunctionCall':
        this.validateFunctionCall(node, errors);
        break;
      case 'CastFunction':
        this.validateCastFunction(node, errors);
        break;
      case 'BinaryExpression':
        this.validateBinaryExpression(node, errors);
        break;
      case 'CaseExpression':
        this.validateCaseExpression(node, errors);
        break;
    }
  }

  private validateField(node: any, errors: string[]): void {
    const field = this.fields.find(f => f.name === node.name);
    if (!field) {
      errors.push(`Unknown field: "${node.name}"`);
    }
  }

  private validateBinaryExpression(node: any, errors: string[]): void {
    // 先验证左右操作数
    this.validateNode(node.left, errors);
    this.validateNode(node.right, errors);

    const leftType = this.getNodeType(node.left);
    const rightType = this.getNodeType(node.right);

    // 如果是算术操作符，检查操作数类型
    if (node.operator.type === 'ArithmeticOperator') {
      // 检查左操作数
      if (!leftType) {
        errors.push(`Left operand of "${node.operator.value}" has unknown type`);
        return;
      }

      // 如果左操作数是函数调用且返回类型是 field，则允许
      if (node.left.type === 'FunctionCall') {
        const leftFunc = this.functions.find(f => f.name === node.left.name);
        if (leftFunc && leftFunc.returnType === 'field') {
          // 允许 field 类型的函数返回值
        } else if (!this.isNumericType(leftType)) {
          errors.push(`Left operand of "${node.operator.value}" must be numeric (int, bigint, double, decimal, float) or field type, but got ${leftType}`);
          return;
        }
      } else if (!this.isNumericType(leftType)) {
        errors.push(`Left operand of "${node.operator.value}" must be numeric (int, bigint, double, decimal, float), but got ${leftType}`);
        return;
      }

      // 检查右操作数
      if (!rightType) {
        errors.push(`Right operand of "${node.operator.value}" has unknown type`);
        return;
      }

      // 如果右操作数是函数调用且返回类型是 field，则允许
      if (node.right.type === 'FunctionCall') {
        const rightFunc = this.functions.find(f => f.name === node.right.name);
        if (rightFunc && rightFunc.returnType === 'field') {
          // 允许 field 类型的函数返回值
        } else if (!this.isNumericType(rightType)) {
          errors.push(`Right operand of "${node.operator.value}" must be numeric (int, bigint, double, decimal, float) or field type, but got ${rightType}`);
          return;
        }
      } else if (!this.isNumericType(rightType)) {
        errors.push(`Right operand of "${node.operator.value}" must be numeric (int, bigint, double, decimal, float), but got ${rightType}`);
        return;
      }
    }
  }

  private isNumericType(type: string): boolean {
    return this.numericTypes.includes(type.toLowerCase());
  }

  private getNodeType(node: any): string | null {
    switch (node.type) {
      case 'NumberLiteral':
        // 检查是否为整数
        return Number.isInteger(node.value) ? 'int' : 'number';
      case 'StringLiteral':
        return 'string';
      case 'Field':
        const field = this.fields.find(f => f.name === node.name);
        return field ? field.dataType : null;
      case 'FunctionCall':
        const func = this.functions.find(f => f.name === node.name);
        return func ? func.returnType : null;
      case 'CastFunction':
        return node.targetType;
      default:
        return null;
    }
  }

  private validateCastFunction(node: any, errors: string[]): void {
    // 验证值
    this.validateNode(node.value, errors);

    // 验证目标类型是否有效
    const validTypes = ['int', 'bigint', 'date', 'timestamp', 'double', 'decimal', 'float', 'string'];
    if (!validTypes.includes(node.targetType)) {
      errors.push(`Invalid cast target type: "${node.targetType}"`);
    }
  }

  private validateFunctionCall(node: any, errors: string[]): void {
    const func = this.functions.find(f => f.name === node.name);
    if (!func) {
      errors.push(`Unknown function: "${node.name}"`);
      return;
    }

    // 计算必填参数的数量
    const requiredParamsCount = func.params.filter(p => !p.optional).length;
    const maxParamsCount = func.params.length;

    // 检查参数数量是否在有效范围内
    if (node.arguments.length < requiredParamsCount || node.arguments.length > maxParamsCount) {
      if (requiredParamsCount === maxParamsCount) {
        errors.push(
          `Function "${node.name}" expects ${requiredParamsCount} arguments, but got ${node.arguments.length}`
        );
      } else {
        errors.push(
          `Function "${node.name}" expects ${requiredParamsCount} to ${maxParamsCount} arguments, but got ${node.arguments.length}`
        );
      }
      return;
    }

    // 验证每个参数
    node.arguments.forEach((arg: any, index: number) => {
      // 先验证嵌套的函数调用
      if (arg.type === 'FunctionCall') {
        this.validateFunctionCall(arg, errors);
      }

      const param = func.params[index];
      // 如果参数类型是 any，跳过类型检查
      if (param.dataType === 'any' || (Array.isArray(param.dataType) && param.dataType.includes('any'))) {
        return;
      }
      this.validateArgument(arg, param, node.name, errors);
    });
  }

  private validateArgument(arg: any, param: any, funcName: string, errors: string[]): void {
    const paramTypes = param.dataType.split('|').map((type: string) => type.trim());
    const argType = this.getNodeType(arg);

    if (!argType) {
      errors.push(`Unknown type for argument in function "${funcName}"`);
      return;
    }

    // 如果参数是函数调用且返回类型是 field，跳过类型验证
    if (arg.type === 'FunctionCall') {
      const func = this.functions.find(f => f.name === arg.name);
      if (func && func.returnType === 'field') {
        return;
      }
    }

    // 如果参数是 field 类型
    if (arg.type === 'Field') {
      const field = this.fields.find(f => f.name === arg.name);
      if (!field) {
        errors.push(`Unknown field: "${arg.name}"`);
        return;
      }

      // 如果参数定义中包含 'field' 类型，则允许任何 field
      if (paramTypes.includes('field')) {
        return;
      }

      // 如果参数定义不包含 'field'，则需要检查 field 的具体类型是否匹配
      if (!paramTypes.some((type: string) => this.isTypeCompatible(field.dataType, type))) {
        errors.push(
          `Type mismatch in function "${funcName}": parameter "${param.name}" expects ${paramTypes.join(' | ')}, but field "${arg.name}" is of type ${field.dataType}`
        );
      }
      return;
    }

    // 如果参数是数值字面量
    if (arg.type === 'NumberLiteral') {
      const isIntegerType = paramTypes.some((type: string) => ['int', 'byte', 'short', 'long'].includes(type.toLowerCase()));
      const isFloatType = paramTypes.some((type: string) => ['float', 'double', 'decimal', 'number'].includes(type.toLowerCase()));
      
      // 如果要求整数类型但输入了小数
      if (isIntegerType && !isFloatType && !Number.isInteger(arg.value)) {
        errors.push(
          `Type mismatch in function "${funcName}": parameter "${param.name}" expects integer type, but got decimal number ${arg.value}`
        );
        return;
      }

      // 如果不是数值类型参数
      if (!isIntegerType && !isFloatType) {
        errors.push(
          `Type mismatch in function "${funcName}": parameter "${param.name}" expects ${paramTypes.join(' | ')}, but got number`
        );
      }
      return;
    }

    // 其他类型的验证
    if (!paramTypes.some((type: string) => this.isTypeCompatible(argType, type))) {
      errors.push(
        `Type mismatch in function "${funcName}": parameter "${param.name}" expects ${paramTypes.join(' | ')}, but got ${argType}`
      );
    }
  }

  private validateCaseExpression(node: any, errors: string[]): void {
    // 验证每个 WHEN 子句
    node.whens.forEach((when: any, index: number) => {
      // 验证条件部分
      this.validateNode(when.condition, errors);
      
      // 验证结果部分
      this.validateNode(when.result, errors);
      
      // 如果不是第一个 WHEN，确保结果类型与第一个 WHEN 的结果类型匹配
      if (index > 0) {
        const firstResultType = this.getNodeType(node.whens[0].result);
        const currentResultType = this.getNodeType(when.result);
        
        if (firstResultType && currentResultType && !this.isTypeCompatible(firstResultType, currentResultType)) {
          errors.push(`Type mismatch in CASE expression: WHEN clause ${index + 1} returns ${currentResultType}, but first WHEN clause returns ${firstResultType}`);
        }
      }
    });

    // 验证 ELSE 子句（如果存在）
    if (node.else) {
      this.validateNode(node.else, errors);
      
      // 确保 ELSE 子句的类型与 WHEN 子句的类型匹配
      const whenType = this.getNodeType(node.whens[0].result);
      const elseType = this.getNodeType(node.else);
      
      if (whenType && elseType && !this.isTypeCompatible(whenType, elseType)) {
        errors.push(`Type mismatch in CASE expression: ELSE clause returns ${elseType}, but WHEN clauses return ${whenType}`);
      }
    }
  }

  private isTypeCompatible(type1: string, type2: string): boolean {
    // 如果类型完全相同
    if (type1 === type2) return true;

    // 如果都是数值类型
    if (this.isNumericType(type1) && this.isNumericType(type2)) return true;

    return false;
  }
} 