import { SurveyedFile } from "../surveying/surveyFile";

const prepareTestContent = async (surveyedFile: SurveyedFile) => {
  console.log(surveyedFile);

  const importStatements = surveyedFile.imports.map((importStatement) => {
    // TODO: Implement without if statements
    if (importStatement.defaultImport && importStatement?.namedImports.length) {
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

  console.log(importStatements);
};

export default prepareTestContent;
