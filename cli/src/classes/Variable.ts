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
  conditionNode?: ConditionNode;
  calls: Call[];
};

type AccessControl = {
  expression: string;
  conditionNode?: ConditionNode;
};

type VisitContext = {
  withinJsxAttribute: boolean;
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
  getProps() {
    const props: {
      name: string;
      type: string;
      isRequired: boolean;
      defaultValue?: any;
      // Enumerated values: If a prop has a limited set of valid values (like an enum), your mock data should only include values from that set.
      // Nested prop types: If a prop has a complex type with nested properties, you'll need to collect information about the nested properties as well to generate accurate mock data.
      // Imported types: If a component imports its prop types from another file of library, your script should be able to resolve the imported types and collect the necessary information about them.
    }[] = [
      {
        name: "isExpanded",
        type: "boolean",
        isRequired: true,
      },
      {
        name: "setIsExpanded",
        type: "(isExpanded: boolean) => void",
        isRequired: true,
      },
    ];

    console.log({ props });

    return props;
  }

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

    console.log(hooks);

    return hooks;
  }
}

export class Hook extends ReactiveFunction {}

export class FC extends ReactiveFunction {
  getMockables() {
    const mockables = [
      {
        name: "usePermissions",
        returns: "permissions",
        controls: [
          "permissions.canViewStats",
          "permissions.canManageMyOrganization",
          "permissions.canManageMyOrganizationMembers",
          "permissions.canManageMyOrganizationSettings",
          "permissions.canManageMyOrganizationTeams",
          "permissions.canManageMyOrganizationProjects",
        ],
        category: "hook",
        type: `() => {
          canViewStats: boolean;
          canManageMyOrganization: boolean;
          canManageMyOrganizationMembers: boolean;
          canManageMyOrganizationSettings: boolean;
          canManageMyOrganizationTeams: boolean;
          canManageMyOrganizationProjects: boolean;
        }`,
        returnType: `{
          canViewStats: boolean;
          canManageMyOrganization: boolean;
          canManageMyOrganizationMembers: boolean;
          canManageMyOrganizationSettings: boolean;
          canManageMyOrganizationTeams: boolean;
          canManageMyOrganizationProjects: boolean;
        }`,
        baseReturnValue: "{}",
      },
      {
        name: "useEntitlements",
        returns: "entitlements",
        controls: [
          "entitlements.length",
          "entitlements.includes('sales')",
          "entitlements.includes('marketing')",
        ],
      },
    ];

    return mockables;
  }

  getTestSubjects() {
    const accessControl: AccessControl[] = [];

    const userEvents: UserEvent[] = [];

    const visit = (node: ts.Node, context: VisitContext) => {
      let newConditionNode = context.conditionNode;

      if (
        ts.isBinaryExpression(node) &&
        (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          node.operatorToken.kind === ts.SyntaxKind.BarBarToken)
      ) {
        // This is a conditional expression
        // Ex: {isAuthenticated && <div>Authenticated</div>}
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

        if (node.parent.whenFalse === node) {
          newConditionNode = {
            type: "not",
            operand: newConditionNode,
          };
        }
      } else if (
        ts.isBinaryExpression(node.parent) &&
        node.parent.operatorToken.kind ===
          ts.SyntaxKind.AmpersandAmpersandToken &&
        node.parent.right === node &&
        (ts.isJsxElement(node) || node.getChildren().some(ts.isJsxElement))
      ) {
        // Found a binary expression with a JSX element
        // Ex: {isAuthenticated && <div>Authenticated</div>}
        let expression = node.getText();
        const child = node.getChildren().find(ts.isJsxElement);
        if (child) {
          expression = child.getText();
        }

        accessControl.push({
          expression,
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

          if (expression) {
            if (ts.isArrowFunction(expression)) {
              // Ex: onClick={() => doSomething()}
              const newCalls = handleArrowFunctionBody(expression.body);
              calls.push(...newCalls);
            } else {
              // Ex: onClick={doSomething}
              calls.push({
                functionName: expression.getText(),
                args: [],
              });
            }
          }
        }

        const textChildren: string[] = [];

        ts.forEachChild(node.parent.parent.parent, (child) => {
          // Gets "Click me" from <button onClick={doSomething}>Click me</button>
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
          conditionNode: newConditionNode,
        });
      }

      return ts.forEachChild(node, (node) =>
        visit(node, {
          withinJsxAttribute:
            context.withinJsxAttribute || ts.isJsxAttribute(node),
          conditionNode: newConditionNode,
        })
      );
    };

    visit(this.node, {
      withinJsxAttribute: false,
      conditionNode: undefined,
    });

    return {
      userEvents,
      accessControl,
    };
  }
}
