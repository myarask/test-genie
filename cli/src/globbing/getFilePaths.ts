import { glob } from "glob";

export const getFilePaths = () => {
  const globs = process.argv.slice(2);

  return glob(globs, {
    nodir: true,
    ignore: {
      ignored: (p) => {
        // Ignore node_modules
        if (p.name === "node_modules") return true;

        // Ignore dist and build folders
        if (p.name === "dist" || p.name === "build") return true;

        // Ignore .d.ts files
        if (p.name.endsWith(".d.ts")) return true;

        // Only test Typescript and Javscript files
        const isJSorTS = /\.(jsx?|tsx?)$/.test(p.name);
        if (!isJSorTS) return true;

        // Do not test test files
        return /\.(test|spec)\.(jsx?|tsx?)$/.test(p.name);
      },
    },
    signal: AbortSignal.timeout(1000),
    maxDepth: 10,
  });
};
