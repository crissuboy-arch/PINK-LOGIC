const fs = require("fs");
// Read the Editor.tsx file and extract lines 500-700
const content = fs.readFileSync("src/pages/Criacao/Editor.tsx", "utf8");
const lines = content.split("\n");
// Output the lines with their line numbers
for (let i = 499; i < Math.min(700, lines.length); i++) {
  const lineNum = (i + 1).toString().padStart(4, " ");
  console.log(lineNum + ": " + lines[i]);
}
