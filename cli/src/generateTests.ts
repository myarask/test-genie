import ts from "typescript";
import isBarrelFile from "./scanning/isBarrelFile";
import surveyFile from "./surveying/surveyFile";
import prepareTestContent from "./writing/prepareTestContent";
import writeTestFile from "./writing/writeTestFile";

const generateTests = async (filePath: string) => {
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  // Do not test barrel files
  // TODO: Do not survey files twice
  if (isBarrelFile(fileContent)) return;

  const surveyedFile = surveyFile(fileContent);
  const testContent = await prepareTestContent(surveyedFile);
  writeTestFile(filePath, testContent);
};

export default generateTests;
