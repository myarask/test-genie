import ts from "typescript";
import isBarrelFile from "./isBarrelFile";

const generateTests = async (filePath: string) => {
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  // Do not test barrel files
  if (isBarrelFile(fileContent)) return;

  // Parse the TypeScript file
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  console.log(filePath);
};

export default generateTests;
