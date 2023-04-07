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
}
