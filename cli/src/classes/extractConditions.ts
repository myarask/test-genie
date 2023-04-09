import * as ts from "typescript";

type ConditionNode =
  | {
      type: "condition";
      condition: string;
    }
  | {
      type: "and" | "or";
      left: ConditionNode;
      right: ConditionNode;
    }
  | {
      type: "not";
      operand: ConditionNode;
    };

export function extractConditions(expression: ts.Expression): ConditionNode {
  if (ts.isBinaryExpression(expression)) {
    if (
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      return {
        type: "and",
        left: extractConditions(expression.left),
        right: extractConditions(expression.right),
      };
    } else if (expression.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
      return {
        type: "or",
        left: extractConditions(expression.left),
        right: extractConditions(expression.right),
      };
    }
  } else if (
    ts.isPrefixUnaryExpression(expression) &&
    expression.operator === ts.SyntaxKind.ExclamationToken
  ) {
    return {
      type: "not",
      operand: extractConditions(expression.operand),
    };
  }
  return {
    type: "condition",
    condition: expression.getText(),
  };
}
