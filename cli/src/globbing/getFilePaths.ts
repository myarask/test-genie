import { glob } from "glob";

export const getFilePaths = () => {
  const globs = process.argv.slice(2);

  // Only process JS and TS files
  const globsWithExtensions = globs.map((glob) => {
    if (glob.endsWith(".ts")) return glob;
    if (glob.endsWith(".tsx")) return glob;
    if (glob.endsWith(".js")) return glob;
    if (glob.endsWith(".jsx")) return glob;
    if (glob.endsWith("**")) return `${glob}/*.{ts,tsx,js,jsx}`;
    if (glob.endsWith("*")) return `${glob}.{ts,tsx,js,jsx}`;

    throw new Error("Can only match with .js, .jsx, .ts, .tsx, * or **");
  });

  return glob(globsWithExtensions, {
    nodir: true,
    ignore: [
      "node_modules/**",
      "{dist,build}/**",
      "**/*.{spec,test}.*",
      "**/*.d.ts",
    ],
    signal: AbortSignal.timeout(1000),
    maxDepth: 10,
  });
};
