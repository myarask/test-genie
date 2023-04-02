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

  getDefaultExport() {
    return this.sourceFile.statements
      .find(ts.isExportAssignment)
      ?.expression.getText();
  }

  getFCs() {
    // Return an array of functional component names
    return this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .filter((variable) => {
        // Check if variable name starts with a capital letter
        const variableName =
          variable.declarationList.declarations[0].name.getText();
        return variableName[0] === variableName[0].toUpperCase();
      })
      .map((variable) =>
        variable.declarationList.declarations[0].name.getText()
      );
  }

  getHooks() {
    return this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .filter((variable) => {
        // Check if variable name starts with "use"
        const variableName =
          variable.declarationList.declarations[0].name.getText();
        return variableName.slice(0, 3) === "use";
      })
      .map((variable) =>
        variable.declarationList.declarations[0].name.getText()
      );
  }
}

export default Survey;
