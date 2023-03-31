function isBarrelFile(fileContent: string) {
  const lines = fileContent.split("\n").map((line) => line.trim());

  // TODO: Detect multi-line imports and exports
  return lines.every(
    (line) =>
      line.startsWith("import") || line.startsWith("export") || line === ""
  );
}

export default isBarrelFile;
