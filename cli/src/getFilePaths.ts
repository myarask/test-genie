import { glob } from "glob";

export const getFilePaths = () => {
  const globs = process.argv.slice(2);

  return glob(globs, {
    nodir: true,
    ignore: "node_modules/**",
    signal: AbortSignal.timeout(1000),
    maxDepth: 10,
  });
};
