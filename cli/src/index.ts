import * as ts from "typescript";
import * as fs from "fs";
import glob from "glob";
import yargs from "yargs";

const main = async () => {
  const globs = process.argv.slice(2);

  const targets = await glob(globs, {
    nodir: true,
    ignore: "node_modules/**",
    signal: AbortSignal.timeout(1000),
  });

  console.log({ globs, targets });

  targets.forEach((filePath) => {
    // Read the contents of the TypeScript file
    const fileContents = ts.sys.readFile(filePath);
    if (!fileContents) {
      throw new Error(`Could not read file: ${filePath}`);
    }

    console.log(filePath);
  });
};

main();
