const fs = require('fs');
const content = fs.readFileSync('src/pages/Criacao/Editor.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 629; i < Math.min(656, lines.length); i++) {
  const line = lines[i];
  let inSingle = false, inDouble = false, inBacktick = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === "'" && !inDouble && !inBacktick) { inSingle = !inSingle; }
    else if (c === '"' && !inSingle && !inBacktick) { inDouble = !inDouble; }
    else if (c === '`' && !inSingle && !inDouble) { inBacktick = !inBacktick; }
    else if (c === '/' && !inSingle && !inDouble && !inBacktick) {
      const before = line.substring(Math.max(0,j-10), j).trimEnd();
      const lastChar = before[before.length-1] || '';
      if ('=([{,:!&|?;'.includes(lastChar) || before === '' || before.endsWith('return') || before.endsWith('case') || before.endsWith('typeof')) {
        console.log('Line ' + (i+1) + ', col ' + (j+1) + ': ...' + line.substring(Math.max(0,j-20), j+20) + '...');
      }
    }
  }
}
