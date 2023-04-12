import Survey from "../classes/Survey";

const prepareTestContent = (survey: Survey, filePath: string) => {
  // console.log(surveyedFile);

  let importTestTools = "";
  if (survey.getFCs().length) {
    // Import render and screen when there are functional components
    importTestTools += `import { render, screen } from "@testing-library/react";\n`;
  }

  const importStatements = survey
    .getImportDeclarations()
    .map((statement) => statement.getText())
    .join("\n");

  // Import target functions from application file
  const target = filePath.split("/").pop()?.split(".")[0];
  const namedTargets = survey.getNamedExports().join(", ");
  const targetContent = [
    survey.getDefaultExport(),
    namedTargets ? `{ ${namedTargets} }` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const importTargets = `import ${targetContent} from "./${target}";`;

  // Mock most imported modules
  // TODO: Implement without if statements?
  let mockedModules = survey
    .getImportDeclarations()
    .map((statement) => `jest.mock(${statement.moduleSpecifier.getText()});`)
    .join("\n");

  if (mockedModules) mockedModules = "\n" + mockedModules;

  // Draft 1 test suite per exported functional component
  const FCSuites = survey
    .getFCs()
    .map((FC) => {
      const subjects = FC.getTestSubjects();
      console.log(JSON.stringify(subjects.userEvents, null, 2));
      console.log(JSON.stringify(subjects.accessControl, null, 2));

      if (
        subjects.userEvents.length &&
        !importTestTools.includes("userEvent")
      ) {
        importTestTools += `import userEvent from "@testing-library/user-event";\n`;
      }

      let suiteMocks = "";
      suiteMocks += "\n  beforeAll(() => {";
      suiteMocks += FC.getHooks()
        .map((hook) => `\n    (${hook.name} as jest.Mock).mockReturnValue({});`)
        .join("");
      suiteMocks += "\n  });";

      let test = "";

      for (let element of subjects.userEvents) {
        const hookMocks: {
          hook: any;
          functions: string[];
        }[] = [];

        test += "\n";
        test += `\n  test("[When] the ${element.textChildren?.[0]} ${element.tagName} is clicked [Then] ...", () => {`;
        test += `\n    render(<${FC.getName()} />);`;
        test += "\n";
        test += `\n    userEvent.click(screen.getByText("${element.textChildren?.[0]}"));`; // TODO: Query by role
        for (let i = 0; i < hookMocks.length; i++) {
          test += `\n    expect(${hookMocks[0].functions[0]}).toBeCalled();`;
        }
        test += "\n  });";
      }

      // TODO: Clean up
      let suite = "";
      suite = `\ndescribe("${FC.getName()}", () => {`;
      suite += suiteMocks;
      suite += test;
      suite += "\n});";

      return suite;
    })
    .join("\n");

  const hookSuites = survey
    .getHooks()
    .map((hook) => {
      return `\ndescribe("${hook.getName()}", () => {});`;
    })
    .join("\n");

  importTestTools = importTestTools.trim();

  return [
    importTestTools,
    importStatements,
    importTargets,
    mockedModules,
    FCSuites,
    hookSuites,
  ]
    .filter(Boolean)
    .join("\n");
};

export default prepareTestContent;
