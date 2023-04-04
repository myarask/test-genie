import ts from "typescript";
import Survey from "./classes/Survey";
import prepareTestContent from "./writing/prepareTestContent";
import writeTestFile from "./writing/writeTestFile";

const generateTests = async (filePath: string) => {
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  const survey = new Survey(fileContent);

  // Do not test barrel files
  if (survey.isBarrelFile()) return;

  console.log({
    filePath,
    namedExports: survey.getNamedExports(),
    defaultExport: survey.getDefaultExport(),
    FCs: survey.getFCs(),
    hooks: survey.getHooks(),
  });

  const testContent = prepareTestContent(survey, filePath);
  writeTestFile(filePath, testContent);
};

export default generateTests;
