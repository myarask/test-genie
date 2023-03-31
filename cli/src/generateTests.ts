import ts from "typescript";
import isBarrelFile from "./isBarrelFile";
import parseImportStatement, {
  ParsedImportStatement,
} from "./parsing/parseImportStatement";

const scanFileContent = (fileContent: string) => {
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
      const importStatement = fileContent
        .slice(node.pos, node.end)
        .replaceAll("\n", " ");

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
    exportStatements, // TODO: Parse export statements
    variableStatements, // TODO: Parse variable statements
  };
};

const generateTests = async (filePath: string) => {
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  // Do not test barrel files
  // TODO: Do not scan files twice
  if (isBarrelFile(fileContent)) return;

  const parsedFileContent = scanFileContent(fileContent);

  console.log(parsedFileContent);
};

export default generateTests;
