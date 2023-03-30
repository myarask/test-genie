import { getFilePaths } from "./getFilePaths";
import generateTests from "./generateTests";

const main = async () => {
  const filePaths = await getFilePaths();

  filePaths.forEach(generateTests);
};

main();
