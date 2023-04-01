import path from "path";
import ts from "typescript";

const writeTestFile = (filePath: string, testContent: string) => {
  // This file does not need a test file

  if (!testContent) return;

  const fileExt = path.extname(filePath);
  const testFilePath = filePath.replace(fileExt, `.test${fileExt}`);

  // Write test content to test file
  ts.sys.writeFile(testFilePath, testContent);
};

export default writeTestFile;
