import { SurveyedFile } from "../surveying/surveyFile";

const prepareTestContent = (surveyedFile: SurveyedFile) => {
  console.log(surveyedFile);

  const copiedImports = surveyedFile.imports.filter(({ source }) => {
    return source !== "react";
  });

  // Copy most import statements from the application file
  const importStatements = copiedImports
    .map((importStatement) => {
      // TODO: Implement without if statements?
      if (
        importStatement.defaultImport &&
        importStatement?.namedImports.length
      ) {
        return `import ${
          importStatement.defaultImport
        }, { ${importStatement.namedImports.join(", ")} } from "${
          importStatement.source
        }";`;
      } else if (importStatement.defaultImport) {
        return `import ${importStatement.defaultImport} from "${importStatement.source}";`;
      } else {
        return `import { ${importStatement.namedImports.join(", ")} } from "${
          importStatement.source
        }";`;
      }
    })
    .join("\n");

  // TODO: Import tested components

  // Mock most imported modules
  // TODO: Implement without if statements?
  let mockedModules = copiedImports
    .map((importStatement) => {
      return `jest.mock("${importStatement.source}");`;
    })
    .join("\n");

  if (mockedModules) mockedModules = "\n" + mockedModules;

  let testContent = [importStatements, mockedModules]
    .filter(Boolean)
    .join("\n");

  // TODO: Draft 1 test suites per exported component

  return testContent;
};

export default prepareTestContent;
