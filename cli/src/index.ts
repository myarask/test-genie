import * as ts from "typescript";
import isBarrelFile from "./isBarrelFile";
import { getFilePaths } from "./getFilePaths";

const main = async () => {
  const filePaths = await getFilePaths();

  filePaths.forEach((filePath) => {
    // Read the contents of the TypeScript file
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
  });
};

main();
