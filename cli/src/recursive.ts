import * as ts from 'typescript';

function logNodes(node: ts.Node) {
  // Check if the node is a conditional expression (ternary operator)
  if (ts.isConditionalExpression(node)) {
    if (ts.isJsxElement(node.whenTrue) || ts.isJsxElement(node.whenFalse)) {
      console.log('Conditional JSX rendering found:', node);
    }
  }
  // Check if the node is a binary expression with the && operator
  else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
    if (ts.isJsxElement(node.right)) {
      console.log('Conditional JSX rendering found:', node);
    }
  }

  ts.forEachChild(node, logNodes);
}

function logNodesInFile(filePath: string) {
  // Read the contents of the TypeScript file
  const fileContents = ts.sys.readFile(filePath);
  if (!fileContents) {
    console.error(`Could not read file: ${filePath}`);
    return;
  }

  // Create a TypeScript source file object
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContents,
    ts.ScriptTarget.Latest,
    true
  );

  // Traverse the AST and log each node
  logNodes(sourceFile);
}

const filePath = 'path/to/your/file.ts';
logNodesInFile(filePath);
