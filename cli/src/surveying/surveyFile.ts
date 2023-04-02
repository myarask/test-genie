import * as ts from "typescript";
import parseImportStatement, {
  ParsedImportStatement,
} from "../parsing/parseImportStatement";

export type Exports = {
  default: string | null;
  named: string[];
};

export type SurveyedFile = {
  imports: ParsedImportStatement[];
  exports: Exports;
  functionalComponents: Record<string, any>;
};

const parseFileContent = (fileContent: string): SurveyedFile => {
  const imports: ParsedImportStatement[] = [];
  const variableStatements: string[] = [];
  const exports: Exports = {
    default: null,
    named: [],
  };
  const functionalComponents: Record<string, any> = {};

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
      // Ex: export { a, b, c };

      // TODO: Accomplish without string manipulation?
      const exportStatement =
        node.exportClause
          ?.getText()
          .replace("{", "")
          .replace("}", "")
          .split(",")
          .map((declaration) => declaration.trim()) ?? [];

      exports.named.push(...exportStatement);
    } else if (ts.isExportAssignment(node)) {
      // Ex: export default a;

      exports.default = node.expression.getText();
    } else if (ts.isVariableStatement(node)) {
      variableStatements.push(fileContent.slice(node.pos, node.end));

      // Get name of variable
      const variableName = node.declarationList.declarations[0].name.getText();

      // Get variable type
      const variableType = node.declarationList.declarations[0].type?.getText();
      console.log({ variableName, variableType });

      // Check if variable is exported
      if (node.modifiers) {
        const isExported = node.modifiers.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        );

        if (isExported) {
          // Ex: export const a = 1;
          exports.named.push(variableName);
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return {
    imports,
    exports,
    functionalComponents,
    // variableStatements, // TODO: Parse variable statements
  };
};

export default parseFileContent;
