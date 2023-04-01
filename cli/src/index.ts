import filePaths from "./paths";
import generateTests from "./generateTests";

const main = async () => {
  // TODO: Start test writing process before all file paths are found?
  await filePaths.collect().then((paths) => paths.forEach(generateTests));
};

main();
