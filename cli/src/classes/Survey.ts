import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { FC, Hook, Variable } from "./Variable";

// TODO: Move this function
const logVariableDeclarationsAndTypes = (
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker
) => {
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node)) {
      const name = node.name.getText();
      const type = typeChecker.getTypeAtLocation(node);
      const typeText = typeChecker.typeToString(type);
      console.log(`Variable ${name} has type ${typeText}`);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
};

class Survey {
  sourceFile: ts.SourceFile;

  constructor(filePath: string) {
    // TODO: Do not hardcode tsConfigPath
    const tsConfigPath = path.resolve("../samples/tsconfig.json");
    const tsConfigText = fs.readFileSync(tsConfigPath, "utf8");
    const tsConfig = ts.parseConfigFileTextToJson(tsConfigPath, tsConfigText);
    const parsedCommandLine = ts.parseJsonConfigFileContent(
      tsConfig.config,
      ts.sys,
      path.dirname(tsConfigPath)
    );

    const program = ts.createProgram({
      rootNames: parsedCommandLine.fileNames.concat(filePath),
      options: parsedCommandLine.options,
    });

    const typeChecker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(filePath);

    if (!sourceFile) {
      throw new Error(`Could not find source file: ${filePath}`);
    }

    this.sourceFile = sourceFile;
    logVariableDeclarationsAndTypes(sourceFile, typeChecker);
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
      .map((statement) => new FC(statement.getNode()));
  }

  getHooks() {
    // TODO: Return array of objects
    return this.sourceFile.statements
      .filter(ts.isVariableStatement)
      .map((statement) => new Variable(statement))
      .filter((statement) => statement.getClassification() === "hook")
      .map((statement) => new Hook(statement.getNode()));
  }
}

export default Survey;
