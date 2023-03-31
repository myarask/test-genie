const regex = /import ((\* as )?.+?)?({.+?})? from "(.+?)"/gs;

export type ParsedImportStatement =
  | {
      defaultImport: string | undefined;
      namedImports: string[];
      source: any;
    }
  | undefined;

// Accepts an import statement and returns an object with the default import, named imports and source
// TODO: ignore commented import statements
const parseImportStatement = (
  importStatement: string
): ParsedImportStatement => {
  let m;

  while ((m = regex.exec(importStatement)) !== null) {
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

    defaultImport = defaultImport?.trim()?.replaceAll(",", "");

    return {
      defaultImport,
      namedImports,
      source,
    };
  }
};

export default parseImportStatement;
