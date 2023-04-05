import Survey from "../classes/Survey";

const prepareTestContent = (survey: Survey, filePath: string) => {
  // console.log(surveyedFile);

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
      let mockAll = "";
      mockAll += "\n  beforeAll(() => {";
      mockAll += FC.getHooks()
        .map((hook) => `\n    (${hook.name} as jest.Mock).mockReturnValue({});`)
        .join("");
      mockAll += "\n  });";

      let testInteractiveElements = "";
      const interactiveElements = FC.getInteractiveElements();

      for (let interactiveElement of interactiveElements) {
        testInteractiveElements += "\n";
        testInteractiveElements += `\n  test("[When] the ${interactiveElement.children} ${interactiveElement.role} is clicked [Then] ...", () => {`;
        testInteractiveElements += `\n    render(<${FC.getName()} />);`;
        testInteractiveElements += `\n    const element = screen.getByText("${interactiveElement.children}");`; // TODO: getByRole instead
        testInteractiveElements += `\n    expect(element).toBeInTheDocument();`;
        testInteractiveElements += `\n    userEvent.click(element);`;
        testInteractiveElements += `\n    expect(${interactiveElement.effect}).toBeCalled();`;
        testInteractiveElements += "\n  })";
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

  return [importStatements, importTargets, mockedModules, FCSuites, hookSuites]
    .filter(Boolean)
    .join("\n");
};

export default prepareTestContent;
