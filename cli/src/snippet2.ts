import * as ts from "typescript";

type PropInfo = {
  name: string;
  type: string;
  isOptional: boolean;
  defaultValue?: any; // Default values are not inferred in this example
};

function collectPropInformation(sourceFile: ts.SourceFile): PropInfo[] | undefined {
  const propInfoList: PropInfo[] = [];

  function findFunctionalComponentProps(node: ts.Node): ts.TypeNode | undefined {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const initializer = node.initializer;
      if (initializer && ts.isArrowFunction(initializer) && ts.isTypeReferenceNode(initializer.type)) {
        const typeArguments = initializer.type.typeArguments;
        if (typeArguments && typeArguments.length === 1) {
          return typeArguments[0];
        }
      }
    }
    return undefined;
  }

  function processPropsTypeNode(node: ts.TypeNode) {
    if (ts.isTypeReferenceNode(node)) {
      const symbol = typeChecker.getSymbolAtLocation(node.typeName);
      if (symbol) {
        const decl = symbol.valueDeclaration;
        if (ts.isTypeAliasDeclaration(decl) || ts.isInterfaceDeclaration(decl)) {
          decl.members.forEach((member) => {
            if (ts.isPropertySignature(member) || ts.isPropertyDeclaration(member)) {
              const propertyName = member.name.getText();
              const propertyType = member.type?.getText() || "unknown";
              const isOptional = ts.isQuestionToken(member.questionToken);

              propInfoList.push({
                name: propertyName,
                type: propertyType,
                isOptional,
              });
            }
          });
        }
      }
    }
  }

  function visit(node: ts.Node) {
    const propsTypeNode = findFunctionalComponentProps(node);
    if (propsTypeNode) {
      processPropsTypeNode(propsTypeNode);
      return; // Stop visiting children if props are found
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return propInfoList.length > 0 ? propInfoList : undefined;
}

// Example usage (same as before):
// ... (same code as the previous example)

const program = createProgram(sourceCode);
const sourceFile = program.getSourceFile("MyComponent.tsx");
const typeChecker = program.getTypeChecker();

if (sourceFile) {
  const propsInfo = collectPropInformation(sourceFile);
  console.log(propsInfo);
}
