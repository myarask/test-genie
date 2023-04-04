import * as ts from "typescript";

export class Variable {
  name: string;
  statement: ts.VariableStatement;

  constructor(statement: ts.VariableStatement) {
    this.name = statement.declarationList.declarations[0].name.getText();
    this.statement = statement;
  }

  getName() {
    return this.name;
  }

  getClassification() {
    console.log({
      name: this.name,
      startsWith: this.name.startsWith("use"),
    });
    // TODO: Implement more reliable classification mechanism
    if (this.name.startsWith("use")) return "hook";
    if (this.name[0] === this.name[0].toUpperCase()) return "FC";

    return;
  }

  isExported() {
    return this.statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    );
  }
}

export class ReactiveFunction extends Variable {}

export class Hook extends ReactiveFunction {}

export class FC extends ReactiveFunction {}
