import * as ts from "typescript";
import parseImportStatement, {
  ParsedImportStatement,
} from "../parsing/parseImportStatement";

const parseFileContent = (fileContent: string) => {
  const imports: ParsedImportStatement[] = [];
  const exportStatements: string[] = [];
  const variableStatements: string[] = [];

  const sourceFile = ts.createSourceFile(
    "temp.ts",
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      // Collect import statements
      const importStatement = fileContent.slice(node.pos, node.end);
      const parsedImport = parseImportStatement(importStatement);

      imports.push(parsedImport);
    } else if (ts.isExportDeclaration(node)) {
      // Collect export statements
      exportStatements.push(fileContent.slice(node.pos, node.end));
    } else if (ts.isExportAssignment(node)) {
      // Collect named exports
      exportStatements.push(fileContent.slice(node.pos, node.end));

      // TODO: Seperate default exports from named exports
    } else if (ts.isVariableStatement(node)) {
      variableStatements.push(fileContent.slice(node.pos, node.end));
      // Collect exported variables
      if (node.modifiers) {
        const isExported = node.modifiers.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        );

        if (isExported) {
          exportStatements.push(fileContent.slice(node.pos, node.end));
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return {
    imports,
    // exportStatements, // TODO: Parse export statements
    // variableStatements, // TODO: Parse variable statements
  };
};

export default parseFileContent;
