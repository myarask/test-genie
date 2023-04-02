import * as ts from "typescript";

export function isReactFunctionalComponent(node: ts.Node): boolean {
  if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node) && !ts.isFunctionExpression(node)) {
    return false;
  }

  // Check if the node returns a JSX element
  function isReturningJSXElement(node: ts.Node): boolean {
    if (ts.isReturnStatement(node) && node.expression && ts.isJsxElement(node.expression)) {
      return true;
    }
    return false;
  }

  // Traverse the AST to find a return statement with a JSX element
  function traverse(node: ts.Node): boolean {
    if (isReturningJSXElement(node)) {
      return true;
    }
    return ts.forEachChild(node, traverse) || false;
  }

  return traverse(node);
}