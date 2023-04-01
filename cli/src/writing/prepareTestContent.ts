import { SurveyedFile } from "../surveying/surveyFile";

const prepareTestContent = async (surveyedFile: SurveyedFile) => {
  console.log(surveyedFile);

  const copiedImports = surveyedFile.imports.filter(({ source }) => {
    return source !== "react";
  });

  const importStatements = copiedImports
    .map((importStatement) => {
      // TODO: Implement without if statements
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

  const mockedModules = copiedImports
    .map((importStatement) => {
      return `jest.mock("${importStatement.source}");`;
    })
    .join("\n");

  console.log({ importStatements, mockedModules });

  let testContent = [importStatements, mockedModules].join("\n");

  return testContent;
};

export default prepareTestContent;