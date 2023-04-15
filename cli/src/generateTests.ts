import ts from "typescript";
import Survey from "./classes/Survey";
import prepareTestContent from "./writing/prepareTestContent";
import writeTestFile from "./writing/writeTestFile";

const generateTests = async ({
  path,
  program,
  typeChecker,
}: {
  path: string;
  program: ts.Program;
  typeChecker: ts.TypeChecker;
}) => {
  //TODO: Remove unnecessary fileContent check?
  const fileContent = ts.sys.readFile(path);
  if (!fileContent) throw new Error(`Could not read file: ${path}`);

  const survey = new Survey(path, program, typeChecker);

  // Do not test barrel files
  if (survey.isBarrelFile()) return;

  const testContent = prepareTestContent(survey, path);
  writeTestFile(path, testContent);
};

export default generateTests;
