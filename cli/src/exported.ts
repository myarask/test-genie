import * as ts from 'typescript';

function getExportedFunctionalComponents(fileContent: string): string[] {
  const exportedComponents: string[] = [];

  const sourceFile = ts.createSourceFile('temp.ts', fileContent, ts.ScriptTarget.Latest, true);

  const visit = (node: ts.Node) => {
    if (
      ts.isFunctionDeclaration(node) &&
      node.modifiers &&
      node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
      node.name
    ) {
      exportedComponents.push(node.name.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return exportedComponents;
}

// Example usage:
const fileContent = `
export function ComponentA() {
  return <div>Component A</div>;
}

function NotExportedComponent() {
  return <div>Not Exported Component</div>;
}

export default function ComponentB() {
  return <div>Component B</div>;
}
`;

const functionalComponents = getExportedFunctionalComponents(fileContent);
console.log('Exported functional components:', functionalComponents);
