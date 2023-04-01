import { SurveyedFile } from "../surveying/surveyFile";

const prepareTestContent = async (surveyedFile: SurveyedFile) => {
  console.log(surveyedFile);

  const importStatements = surveyedFile.imports
    .filter(({ source }) => source !== "react")
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
    });

  let testContent = importStatements.join("\n");

  return testContent;
};

export default prepareTestContent;
