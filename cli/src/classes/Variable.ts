import * as ts from "typescript";

type Call = {
  functionName: string;
  args: string[];
};

const extractConditions = (
  expression: ts.Expression,
  conditions: string[] = []
) => {
  if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
  ) {
    extractConditions(expression.left, conditions);
    extractConditions(expression.right, conditions);
  } else if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.BarBarToken
  ) {
    console.log("BARBAR");
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
  const calls: {
    functionName: string;
    args: string[];
  }[] = [];

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
    // TODO: Implement. Not hardcode.
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
    const accessControl: {
      // tagName: string;
      expression: string;
      conditions: string[];
    }[] = [];

    const userEvents: {
      tagName: string;
      propName: string;
      propValue: string | boolean;
      textChildren: string[];
      conditions: string[];
      calls: Call[];
    }[] = [];

    const visit = (
      node: ts.Node,
      context: { withinJsxAttribute: boolean; conditions: string[] }
    ) => {
      const newConditions: string[] = [];

      // Check if there are any conditions on this node
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        // TODO: Handle combined conditions (ex: condition1 && condition2 && <div />)
        // TODO: Handle ORs (ex: condition1 || condition2 && <div />)

        newConditions.push(...extractConditions(node.left));
      }

      // Check if this node is a child of a conditional expression
      if (
        ts.isConditionalExpression(node.parent) &&
        !context.withinJsxAttribute
      ) {
        // TODO: Handle combined conditions (ex: condition1 && condition2 ? <div /> : <span />)
        if (node.parent.whenTrue === node) {
          // TODO: Handle ORs (ex: condition1 || condition2 ? <div /> : <span />)
          newConditions.push(...extractConditions(node.parent.condition));
        } else if (node.parent.whenFalse === node) {
          // TODO:
          newConditions.push(`!(${node.parent.condition.getText()})`);
        }
      }

      if (
        ts.isBinaryExpression(node.parent) &&
        node.parent.operatorToken.kind ===
          ts.SyntaxKind.AmpersandAmpersandToken &&
        node.parent.right === node &&
        (ts.isJsxElement(node) || node.getChildren().some(ts.isJsxElement))
      ) {
        let expression = node.getText();
        const child = node.getChildren().find(ts.isJsxElement);
        if (child) {
          expression = child.getText();
        }

        accessControl.push({
          expression,
          conditions: [...context.conditions, ...newConditions],
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
        });
      }

      return ts.forEachChild(node, (node) =>
        visit(node, {
          withinJsxAttribute:
            context.withinJsxAttribute || ts.isJsxAttribute(node),
          conditions: [...context.conditions, ...newConditions],
        })
      );
    };

    visit(this.node, {
      withinJsxAttribute: false,
      conditions: [],
    });

    return {
      userEvents,
      accessControl,
    };
  }
}
