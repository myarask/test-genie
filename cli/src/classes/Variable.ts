import * as ts from "typescript";

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
      expression: string;
      conditions: string[];
    }[] = [];

    const userEvents: {
      tagName: string;
      propName: string;
      propValue: string | boolean;
      textChildren: string[];
      conditions: string[];
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
        newConditions.push(node.left.getText());
      }

      // Check if this node is a child of a conditional expression
      if (
        ts.isConditionalExpression(node.parent) &&
        !context.withinJsxAttribute
      ) {
        // TODO: Handle combined conditions (ex: condition1 && condition2 ? <div /> : <span />)
        if (node.parent.whenTrue === node) {
          newConditions.push(node.parent.condition.getText());
        } else if (node.parent.whenFalse === node) {
          newConditions.push(`!(${node.parent.condition.getText()})`);
        }
      }

      if (
        ts.isBinaryExpression(node.parent) &&
        node.parent.operatorToken.kind ===
          ts.SyntaxKind.AmpersandAmpersandToken &&
        node.parent.right === node
      ) {
        console.log("---");
        console.log("Conditional Render");
        console.log("Condition: ", node.parent.left.getText());
        console.log("Expression: ", node.getText());

        accessControl.push({
          expression: node.getText(),
          conditions: [...context.conditions, ...newConditions],
        });
      }

      // Check if this node has a user event
      // TODO: JSX Self Closing Elements don't have children. Treat them differently.
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = node.tagName.getText();

        node.attributes.properties.forEach((prop) => {
          if (ts.isJsxAttribute(prop)) {
            const propName = prop.name.getText();
            const propValue = prop.initializer?.getText() ?? true;

            // TODO: Test more user events (ex: onFocus, onBlur, onMouseEnter, onMouseLeave...)
            if (propName === "onClick") {
              const textChildren: string[] = [];

              ts.forEachChild(node.parent, (child) => {
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
                textChildren,
                conditions: [...context.conditions, ...newConditions],
              });
            }
          } else if (ts.isJsxSpreadAttribute(prop)) {
            // TODO: Find test cases in spread attributes
            const propName = prop.expression.getText();
          }
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
