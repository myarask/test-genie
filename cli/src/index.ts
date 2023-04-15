import filePaths from "./paths";
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import generateTests from "./generateTests";

// Looks up the directory tree for a tsconfig.json file
const findTsConfig = (startDir: string): string | null => {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const tsConfigPath = path.join(currentDir, "tsconfig.json");
    if (fs.existsSync(tsConfigPath)) return tsConfigPath;
    currentDir = path.dirname(currentDir);
  }

  return null;
};

const main = async () => {
  // TODO: Start test writing process before all file paths are found?
  const paths = await filePaths.collect();

  if (!paths.length) {
    console.log("No files found");
    return;
  }

  // Assume only 1 tsconfig.json file exists in the project
  const tsConfigPath = findTsConfig(paths[0]);

  if (!tsConfigPath) {
    throw new Error("Could not find tsconfig.json file");
  }

  // Create a typescript program that is compatible with the project
  const tsConfigText = fs.readFileSync(tsConfigPath, "utf8");
  const tsConfig = ts.parseConfigFileTextToJson(tsConfigPath, tsConfigText);
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    tsConfig.config,
    ts.sys,
    path.dirname(tsConfigPath)
  );
  const program = ts.createProgram({
    rootNames: parsedCommandLine.fileNames.concat(paths),
    options: parsedCommandLine.options,
  });

  // Get type checker from program
  const typeChecker = program.getTypeChecker();

  paths.forEach((path) => {
    generateTests({ path, program, typeChecker });
  });
};

main();
