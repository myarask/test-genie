import ts from "typescript";
import Survey from "./classes/Survey";
import prepareTestContent from "./writing/prepareTestContent";
import writeTestFile from "./writing/writeTestFile";

const generateTests = async (filePath: string) => {
  //TODO: Remove unnecessary fileContent check?
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  const survey = new Survey(filePath);

  // Do not test barrel files
  if (survey.isBarrelFile()) return;

  const testContent = prepareTestContent(survey, filePath);
  writeTestFile(filePath, testContent);
};

export default generateTests;
