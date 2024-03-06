const glob = require('glob');
const fs = require("fs-extra");
const exportsFileName = "exports-index";
const exportsFileNameWithExt = `${exportsFileName}.ts`;
const exportsIndexFiles = glob.sync(`./src/**/${exportsFileNameWithExt}`);
//loop every exportsIndexFiles and find any import to a directory, and replace with /exports-index
console.time("fixing direcry imports");
exportsIndexFiles.forEach(file => {
    var content = fs.readFileSync(file, "utf8").split("\n");
    var parentFolderContent = fs.readdirSync(file.replace(exportsFileNameWithExt, ''));
    var hasChanges = false;
    //loop every import - if it does not match a file in the folder, but matches a sub-folder - append exports-index to it
    content.forEach((line, idx) => {
        if (line.replace(/ /g, '').length > 0) {
            let importName = line.slice(line.indexOf('./') + 2, line.length - 2);
            if (parentFolderContent.includes(importName))//its a folder, otherwise it would be .ts
            {
                content[idx] = line.replace(`./${importName}`, `./${importName}/${exportsFileName}`);
                hasChanges = true;
            }
        }
    });
    if (hasChanges) {
        fs.writeFileSync(file, content.join('\n'));
    }
});
console.timeEnd("fixing direcry imports");