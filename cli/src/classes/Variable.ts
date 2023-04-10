import * as ts from "typescript";
import {
  ConditionNode,
  extractConditions as getConditionNode,
} from "./extractConditions";

type Call = {
  functionName: string;
  args: string[];
};

type UserEvent = {
  tagName: string;
  propName: string;
  propValue: string | boolean;
  textChildren: string[];
  conditions: string[];
  conditionNode?: ConditionNode;
  calls: Call[];
};

type AccessControl = {
  expression: string;
  conditions: string[];
  conditionNode?: ConditionNode;
};

type VisitContext = {
  withinJsxAttribute: boolean;
  conditions: string[];
  conditionNode?: ConditionNode;
};

const extractConditions = (
  expression: ts.Expression,
  conditions: string[] = []
) => {
  if (ts.isBinaryExpression(expression)) {
    if (
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      extractConditions(expression.left, conditions);
      extractConditions(expression.right, conditions);
    }
  } else {
    conditions.push(expression.getText());
  }

  return conditions;
};

const processCallExpression = (node: ts.CallExpression) => {
  const functionName = node.expression.getText();
  const args = node.arguments.map((arg) => arg.getText());

  return { functionName, args };
};

const handleArrowFunctionBody = (node: ts.Node) => {
  const calls: Call[] = [];

  if (ts.isBlock(node)) {
    ts.forEachChild(node, (statement) => {
      if (
        ts.isExpressionStatement(statement) &&
        ts.isCallExpression(statement.expression)
      ) {
        const call = processCallExpression(statement.expression);
        calls.push(call);
      }
    });
  } else if (ts.isCallExpression(node)) {
    const call = processCallExpression(node);
    calls.push(call);
  }

  return calls;
};

export class Variable {
  name: string;
  node: ts.VariableStatement;

  constructor(node: ts.VariableStatement) {
    this.name = node.declarationList.declarations[0].name.getText();
    this.node = node;
  }

  getName() {
    return this.name;
  }

  getNode() {
    return this.node;
  }

  getClassification() {
    // TODO: Implement more reliable classification mechanism
    if (this.name.startsWith("use")) return "hook";
    if (this.name[0] === this.name[0].toUpperCase()) return "FC";

    return;
  }

  isExported() {
    return this.node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    );
  }
}

export class ReactiveFunction extends Variable {
  getHooks() {
    const regex = /(const|var|let) (.+) = (use.+)\(\)/g;
    const text = this.node.getText();
    let m;

    const hooks: {
      statement: "const" | "var" | "let";
      text: string;
      output: string;
      name: string;
    }[] = [];

    while ((m = regex.exec(text)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      hooks.push({
        statement: m[0],
        text: m[1],
        output: m[2],
        name: m[3],
      });
    }

    return hooks;
  }

  getSources() {
    // TODO: Remove this
    const sources = {
      launch: {
        killerApp: "useKillerApp",
      },
      loginWithRedirect: {
        auth0: "useAuth0",
      },
      setIsExpanded: "props",
    };

    return sources;
  }
}

export class Hook extends ReactiveFunction {}

export class FC extends ReactiveFunction {
  // TODO: Remove this
  getInteractiveElements() {
    const regex =
      /<(.+)(?: .+)? (onClick)={(.+)}(?: .+)?>\n?(.+)\n?( *)<\/.+>/g;
    let m;

    const interactiveElements: {
      text: string;
      element: string;
      event: "onClick" | "onFocus" | "onBlur" | "onMouseEnter" | "onMouseLeave";
      role: "button" | "link" | "input" | "select" | "textarea";
      children: string;
      effect: string;
    }[] = [];

    while ((m = regex.exec(this.node.getText())) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      interactiveElements.push({
        text: m[0],
        element: m[1],
        event: m[2],
        effect: m[3],
        children: m[4].trim(),
        role: "button", // TODO: Implement role detection
      });
    }

    return interactiveElements;
  }

  getTestSubjects() {
    const accessControl: AccessControl[] = [];

    const userEvents: UserEvent[] = [];

    const visit = (node: ts.Node, context: VisitContext) => {
      const newConditions: string[] = [];
      let newConditionNode = context.conditionNode;

      // Check if there are any conditions on this node
      if (
        ts.isBinaryExpression(node) &&
        (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          node.operatorToken.kind === ts.SyntaxKind.BarBarToken)
      ) {
        if (!newConditionNode) {
          newConditionNode = getConditionNode(node.left);
        } else {
          const type =
            node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
              ? "and"
              : "or";
          newConditionNode = {
            type,
            left: newConditionNode,
            right: getConditionNode(node.left),
          };
        }

        newConditions.push(...extractConditions(node.left));
      }

      if (
        ts.isConditionalExpression(node.parent) &&
        !context.withinJsxAttribute
      ) {
        // Found a conditional expression
        // Ex: {isAuthenticated ? <button>Logout</button> : <button>Login</button>}
        if (!newConditionNode) {
          newConditionNode = getConditionNode(node.parent.condition);
        } else {
          newConditionNode = {
            type: "and",
            left: newConditionNode,
            right: getConditionNode(node.parent.condition),
          };
        }

        if (node.parent.whenTrue === node) {
          newConditions.push(...extractConditions(node.parent.condition));
        } else if (node.parent.whenFalse === node) {
          newConditionNode = {
            type: "not",
            operand: newConditionNode,
          };
          newConditions.push(`!(${node.parent.condition.getText()})`);
        }
      } else if (
        ts.isBinaryExpression(node.parent) &&
        node.parent.operatorToken.kind ===
          ts.SyntaxKind.AmpersandAmpersandToken &&
        node.parent.right === node &&
        (ts.isJsxElement(node) || node.getChildren().some(ts.isJsxElement))
      ) {
        // Found a conditional element
        // Ex: {isAuthenticated && <div>Authenticated</div>}
        let expression = node.getText();
        const child = node.getChildren().find(ts.isJsxElement);
        if (child) {
          expression = child.getText();
        }

        accessControl.push({
          expression,
          conditions: [...context.conditions, ...newConditions],
          conditionNode: newConditionNode,
        });
      }

      // Check if this node has a user event
      if (ts.isJsxAttribute(node) && node.name.escapedText === "onClick") {
        const tagName = node.parent.parent.tagName.getText();
        const propName = node.name.escapedText;
        const initializer = node.initializer;
        const propValue = initializer?.getText() ?? true;

        const calls: Call[] = [];

        if (initializer && ts.isJsxExpression(initializer)) {
          const expression = initializer.expression;
          if (expression && ts.isArrowFunction(expression)) {
            const newCalls = handleArrowFunctionBody(expression.body);
            calls.push(...newCalls);
          }
        }

        const textChildren: string[] = [];

        ts.forEachChild(node.parent.parent.parent, (child) => {
          if (ts.isJsxText(child)) {
            const textChild = child.getText().trim();
            if (textChild) {
              textChildren.push(textChild);
            }
          }
        });

        userEvents.push({
          tagName,
          propName,
          propValue,
          calls,
          textChildren,
          conditions: context.conditions,
          conditionNode: newConditionNode,
        });
      }

      return ts.forEachChild(node, (node) =>
        visit(node, {
          withinJsxAttribute:
            context.withinJsxAttribute || ts.isJsxAttribute(node),
          conditions: [...context.conditions, ...newConditions],
          conditionNode: newConditionNode,
        })
      );
    };

    visit(this.node, {
      withinJsxAttribute: false,
      conditions: [],
      conditionNode: undefined,
    });

    return {
      userEvents,
      accessControl,
    };
  }
}
