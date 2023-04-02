import ts from "typescript";
import Survey from "./classes/Survey";
import surveyFile from "./surveying/surveyFile";
import prepareTestContent from "./writing/prepareTestContent";
import writeTestFile from "./writing/writeTestFile";

const generateTests = async (filePath: string) => {
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  const survey = new Survey(fileContent);

  // Do not test barrel files
  if (survey.isBarrelFile()) return;

  const surveyedFile = surveyFile(fileContent);
  const testContent = prepareTestContent(surveyedFile, filePath);
  writeTestFile(filePath, testContent);
};

export default generateTests;
