const fs = require('fs');
const path = require('path');

function isBarrelFile(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n').map(line => line.trim());

  let inImportExportBlock = false;
  return lines.every(line => {
    if (line.startsWith('import') || line.startsWith('export')) {
      inImportExportBlock = true;
    } else if (inImportExportBlock && (line.endsWith('}') || line.endsWith('};'))) {
      inImportExportBlock = false;
    } else if (inImportExportBlock && !line.endsWith(',') && !line.endsWith('{')) {
      return false;
    }

    return inImportExportBlock || line === '';
  });
}

export default isBarrelFile;