import * as ts from "typescript";

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
      .filter((statement) => {
        return statement.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        );
      })
      .map((statement) => {
        return statement.declarationList.declarations[0].name.getText();
      })
      .flat();

    return [...exportDeclarationNames, ...variableAssignmentNames];
  }

  getFCs() {
    // TODO: Return array of objects
    return this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .filter((statement) => {
        // Check if variable name starts with a capital letter
        const variableName =
          statement.declarationList.declarations[0].name.getText();
        return variableName[0] === variableName[0].toUpperCase();
      })
      .map((statement) => ({
        name: statement.declarationList.declarations[0].name.getText(),
      }));
  }

  getHooks() {
    // TODO: Return array of objects
    return this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .filter((variable) => {
        // Check if variable name starts with "use"
        const variableName =
          variable.declarationList.declarations[0].name.getText();
        return variableName.slice(0, 3) === "use";
      })
      .map((variable) => {
        return {
          name: variable.declarationList.declarations[0].name.getText(),
        };
      });
  }
}

export default Survey;
