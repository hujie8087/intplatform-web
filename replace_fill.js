const fs = require("fs");
const path = require("path");

const directoryPath = path.join("d:\\IWIPproject\\intplatform\\intplatform-web\\src\\assets\\icons");
const targetString = 'fill="#FFFFFF"';
const replacementString = 'fill="currentColor"';

function processDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`Directory not found: ${directory}`);
    return;
  }

  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (path.extname(file).toLowerCase() === ".svg") {
      let content = fs.readFileSync(filePath, "utf8");
      if (content.includes(targetString)) {
        content = content.split(targetString).join(replacementString);
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Updated: ${filePath}`);
      }
    }
  });
}

console.log("Starting replacement...");
processDirectory(directoryPath);
console.log("Replacement complete.");
