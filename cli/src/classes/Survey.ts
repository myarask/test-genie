import * as ts from "typescript";
import { Variable } from "./Variable";

class Survey {
  lines: string[];
  fileContent: string;
  sourceFile: ts.SourceFile;

  constructor(fileContent: string) {
    const sourceFile = ts.createSourceFile(
      "temp.ts",
      fileContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const printer = ts.createPrinter({ removeComments: true });

    // Remove comments and empty lines

    this.lines = printer
      .printFile(sourceFile)
      .split("\n")
      .filter((line) => line.trim() !== "");

    this.fileContent = this.lines.join("\n");

    this.sourceFile = ts.createSourceFile(
      "temp.ts",
      this.fileContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
  }

  isBarrelFile() {
    return this.sourceFile.statements.every(
      (statement) =>
        ts.isImportDeclaration(statement) ||
        ts.isExportDeclaration(statement) ||
        ts.isExportAssignment(statement)
    );
  }

  getImportDeclarations() {
    return this.sourceFile.statements
      .filter(ts.isImportDeclaration)
      .filter(
        (statement) =>
          statement.moduleSpecifier
            .getText()
            .replaceAll("'", "")
            .replaceAll('"', "") !== "react"
      );
  }

  getDefaultExport() {
    return this.sourceFile.statements
      .find(ts.isExportAssignment)
      ?.expression.getText();
  }

  getNamedExports() {
    const exportDeclarationNames = this.sourceFile.statements
      .filter(ts.isExportDeclaration)
      .map(
        ({ exportClause }) =>
          exportClause
            ?.getText()
            .replace("{", "")
            .replace("}", "")
            .split(",")
            .map((declaration) => declaration.trim()) ?? []
      )
      .flat();

    const variableAssignmentNames = this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .map((statement) => new Variable(statement))
      .filter((statement) => statement.isExported())
      .map((statement) => statement.getName())
      .flat();

    return [...exportDeclarationNames, ...variableAssignmentNames];
  }

  getFCs() {
    // TODO: Return array of objects
    return this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .map((statement) => new Variable(statement))
      .filter((statement) => statement.getClassification() === "FC")
      .map((statement) => ({ name: statement.getName() }));
  }

  getHooks() {
    // TODO: Return array of objects
    return this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .map((statement) => new Variable(statement))
      .filter((statement) => statement.getClassification() === "hook")
      .map((statement) => ({ name: statement.getName() }));
  }
}

export default Survey;
