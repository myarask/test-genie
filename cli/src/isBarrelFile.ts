const fs = require('fs');
const path = require('path');

const isBarrelFile = (file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n').map(line => line.trim());
  return lines.every(line => line.startsWith('import') || line.startsWith('export') || line === '');
}

export default isBarrelFile;
