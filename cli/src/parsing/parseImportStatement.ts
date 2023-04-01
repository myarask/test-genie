export type ParsedImportStatement = {
  defaultImport?: string;
  namedImports: string[];
  source: string;
};

// Accepts an import statement and returns an object with the default import, named imports and source
const parseImportStatement = (
  importStatement: string
): ParsedImportStatement => {
  let m;

  // Remove comments from import statement
  const cleanImportStatement = importStatement
    .replaceAll(/\/\/.+?\n/gs, "")
    .trim();

  // Not sure why this regex needs to be scoped to the function, but it does
  // TODO: Improve legibility of regex
  const regex = /import ((\* as )?.+?)?({.+?})? from "(.+?)"/gs;

  // TODO: Implement without loop?
  while ((m = regex.exec(cleanImportStatement)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    const [, group1, group2, group3, source] = m;

    let defaultImport: string | undefined;
    let namedImports: string[] = [];

    if (group1 && group2 && !group3) {
      // Ex: import * as React from 'react';
      defaultImport = group1;
    } else if (group1 && !group2 && !group3) {
      if (group1.startsWith("{")) {
        // Ex: import { useState } from 'react';
        defaultImport = undefined;
        namedImports = group1
          .replaceAll("{", "")
          .replaceAll("}", "")
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name);
      } else {
        // Ex: import React from 'react';
        defaultImport = group1;
      }
    } else if (group1 && !group2 && group3) {
      // Ex: import React, { useState } from 'react';
      defaultImport = group1;
    }

    // Clean up trailing commas
    // TODO: Improve regex to avoid this
    defaultImport = defaultImport?.trim()?.replaceAll(",", "");

    return {
      defaultImport,
      namedImports,
      source,
    };
  }

  throw new Error("Failed regex match in parseImportStatement");
};

export default parseImportStatement;
