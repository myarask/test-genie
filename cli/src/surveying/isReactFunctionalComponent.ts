import * as ts from "typescript";

export function isReactFunctionalComponent(node: ts.Node): boolean {
  if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node) && !ts.isFunctionExpression(node)) {
    return false;
  }

  // Check if the node is a JSX node
  function isJSXNode(node: ts.Node): boolean {
    return (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxExpression(node) ||
      ts.isJsxFragment(node)
    );
  }

  // Traverse the AST to find any JSX nodes
  function visit(node: ts.Node): boolean {
    if (isJSXNode(node)) {
      return true;
    }
    return ts.forEachChild(node, visit) || false;
  }

  return visit(node);
}
