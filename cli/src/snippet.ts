import * as ts from "typescript";

type PropInfo = {
  name: string;
  type: string;
  isOptional: boolean;
  defaultValue?: any; // Default values are not inferred in this example
};

function collectPropInformation(sourceFile: ts.SourceFile): PropInfo[] {
  const propInfoList: PropInfo[] = [];

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const name = node.name.getText();
      if (name === "Props") {
        node.members.forEach((member) => {
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

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return propInfoList;
}

// Example usage:
const sourceCode = `
import React from 'react';

type Props = {
  name: string;
  age: number;
  isStudent?: boolean;
};

const MyComponent: React.FC<Props> = ({ name, age, isStudent }) => {
  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      {isStudent && <p>Student</p>}
    </div>
  );
};
`;

function createProgram(sourceCode: string): ts.Program {
  const fileName = "MyComponent.tsx";
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React,
  };

  const compilerHost: ts.CompilerHost = {
    getSourceFile: (name) => (name === fileName ? ts.createSourceFile(name, sourceCode, compilerOptions.target, true) : undefined),
    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: () => {},
    getCurrentDirectory: () => "",
    getDirectories: () => [],
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (name) => name === fileName,
    readFile: () => "",
    resolveModuleNames: () => [],
    getEnvironmentVariable: () => "",
  };

  const program = ts.createProgram([fileName], compilerOptions, compilerHost);
  return program;
}

const program = createProgram(sourceCode);
const sourceFile = program.getSourceFile("MyComponent.tsx");

if (sourceFile) {
  const propsInfo = collectPropInformation(sourceFile);
  console.log(propsInfo);
}
