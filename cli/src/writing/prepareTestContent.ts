import { SurveyedFile } from "../surveying/surveyFile";

const prepareTestContent = (surveyedFile: SurveyedFile, filePath: string) => {
  // console.log(surveyedFile);

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

  // Import target functions from application file
  const target = filePath.split("/").pop()?.split(".")[0];
  const defaultTarget = surveyedFile.exports.default;
  const namedTargets = surveyedFile.exports.named.join(", ");
  const targetContent = [
    defaultTarget,
    namedTargets ? `{ ${namedTargets} }` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const importTargets = `import ${targetContent} from "./${target}";`;

  // Mock most imported modules
  // TODO: Implement without if statements?
  let mockedModules = copiedImports
    .map((importStatement) => {
      return `jest.mock("${importStatement.source}");`;
    })
    .join("\n");

  if (mockedModules) mockedModules = "\n" + mockedModules;

  // Draft 1 test suite per exported functional component
  let FCSuites = Object.keys(surveyedFile.functionalComponents)
    .map((key) => {
      return `\ndescribe("${key}", () => {});`;
    })
    .join("\n");

  let hookSuites = Object.keys(surveyedFile.hooks)
    .map((key) => {
      return `\ndescribe("${key}", () => {});`;
    })
    .join("\n");

  return [importStatements, importTargets, mockedModules, FCSuites, hookSuites]
    .filter(Boolean)
    .join("\n");
};

export default prepareTestContent;
