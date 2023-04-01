import ts from "typescript";
import isBarrelFile from "./scanning/isBarrelFile";
import surveyFile from "./surveying/surveyFile";

const generateTests = async (filePath: string) => {
  const fileContent = ts.sys.readFile(filePath);
  if (!fileContent) throw new Error(`Could not read file: ${filePath}`);

  // Do not test barrel files
  // TODO: Do not scan files twice
  if (isBarrelFile(fileContent)) return;

  const surveyedFile = surveyFile(fileContent);

  // console.log(filePath);
  console.log(surveyedFile);
};

export default generateTests;
