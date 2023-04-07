import Survey from "../classes/Survey";

const prepareTestContent = (survey: Survey, filePath: string) => {
  // console.log(surveyedFile);

  let importTestTools = "";
  if (survey.getFCs().length) {
    // Import render and screen when there are functional components
    importTestTools += `import { render, screen } from "@testing-library/react";\n`;
  }

  if (
    survey
      .getFCs()
      .map((FC) => FC.getInteractiveElements())
      .flat().length
  ) {
    // Import userEvent when there are interactive elements
    importTestTools += `import userEvent from "@testing-library/user-event";\n`;
  }

  importTestTools = importTestTools.trim();

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
      const sources = FC.getSources();

      let mockAll = "";
      mockAll += "\n  beforeAll(() => {";
      mockAll += FC.getHooks()
        .map((hook) => `\n    (${hook.name} as jest.Mock).mockReturnValue({});`)
        .join("");
      mockAll += "\n  });";

      let testInteractiveElements = "";
      const interactiveElements = FC.getInteractiveElements();

      for (let interactiveElement of interactiveElements) {
        const hookMocks: {
          hook: any;
          functions: string[];
        }[] = [];

        console.log(interactiveElement.effect);

        if (!interactiveElement.effect.includes("=>")) {
          const chain = interactiveElement.effect.split(".").reverse();
          let chainSource = sources;

          // Find the hook that supplies the function
          for (let key of chain) {
            chainSource = chainSource[key];
          }

          hookMocks.push({
            hook: chainSource,
            functions: [interactiveElement.effect.split(".").slice(-1)[0]],
          });
        }

        console.log(hookMocks);

        testInteractiveElements += "\n";
        testInteractiveElements += `\n  test("[When] the ${interactiveElement.children} ${interactiveElement.role} is clicked [Then] ...", () => {`;
        for (let i = 0; i < hookMocks.length; i++) {
          testInteractiveElements += `\n    const ${hookMocks[0].functions[0]} = jest.fn();`;
          testInteractiveElements += `\n    (${hookMocks[0].hook} as jest.Mock).mockReturnValueOnce({ ${hookMocks[0].functions[0]} });`;
        }
        testInteractiveElements += `\n    render(<${FC.getName()} />);`;
        testInteractiveElements += `\n    const element = screen.getByText("${interactiveElement.children}");`; // TODO: getByRole instead
        testInteractiveElements += `\n    expect(element).toBeInTheDocument();`;
        testInteractiveElements += `\n    userEvent.click(element);`;
        for (let i = 0; i < hookMocks.length; i++) {
          testInteractiveElements += `\n    expect(${hookMocks[0].functions[0]}).toBeCalled();`;
        }
        testInteractiveElements += "\n  });";
      }

      // TODO: Clean up
      let suite = "";
      suite = `\ndescribe("${FC.getName()}", () => {`;
      suite += mockAll;
      suite += testInteractiveElements;
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
