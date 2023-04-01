import ts from "typescript";
import isBarrelFile from "./scanning/isBarrelFile";
import parseFileContent from "./parsing/parseFileContent";

const generateTests = async (filePath: string) => {
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  // Do not test barrel files
  // TODO: Do not scan files twice
  if (isBarrelFile(fileContent)) return;

  const parsedFileContent = parseFileContent(fileContent);

  // console.log(filePath);
  console.log(parsedFileContent);
};

export default generateTests;
