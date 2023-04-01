import { getFilePaths } from "./globbing/getFilePaths";
import generateTests from "./generateTests";

const main = async () => {
  // TODO: Start test writing process before all file paths are found?
  const filePaths = await getFilePaths();

  filePaths.forEach(generateTests);
};

main();
