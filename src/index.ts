import * as ts from "typescript";
import * as fs from "fs";

const processFile = (fileName: string) => {
  const fileContent = fs.readFileSync(fileName);
};

const main = () => {
  const fileName = "samples/import/index.ts";
  const fileContent = fs.readFileSync(fileName, "utf-8");
  const sourceFile = ts.createSourceFile(
    fileName,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const visitNode = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      console.log(node);
      console.log(node.moduleSpecifier.getText());
      //   node.importClause?.namedBindings?.forEachChild((node) => {
      //     node.end;
      //   });

      // Get the module name
      const moduleName = node.moduleSpecifier.getText().replace(/['"]/g, "");

      console.log(moduleName);
      // Get the module path
      //   const modulePath = require.resolve(moduleName);
      //   // Get the module content
      //   const moduleContent = fs.readFileSync(modulePath, "utf-8");
    }
    ts.forEachChild(node, visitNode);
  };

  visitNode(sourceFile);

  //   console.log(fileContent);
};

main();
