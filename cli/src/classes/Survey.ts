import * as ts from "typescript";

class Survey {
  lines: string[];
  fileContent: string;
  sourceFile: ts.SourceFile;

  constructor(fileContent: string) {
    const sourceFile = ts.createSourceFile(
      "temp.ts",
      fileContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const printer = ts.createPrinter({ removeComments: true });

    // Remove comments and empty lines

    this.lines = printer
      .printFile(sourceFile)
      .split("\n")
      .filter((line) => line.trim() !== "");

    this.fileContent = this.lines.join("\n");

    this.sourceFile = ts.createSourceFile(
      "temp.ts",
      this.fileContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
  }

  isBarrelFile() {
    return this.lines.every(
      (line) => line.startsWith("import") || line.startsWith("export")
    );
  }
}

export default Survey;