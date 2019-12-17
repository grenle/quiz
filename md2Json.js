const markdown = require("markdown").markdown;
const fs = require('fs').promises;
const path = require('path');
const ncp = require('ncp').ncp;


// concurrency limit for ncp
ncp.limit = 16;



/**
 * Convert a quiz question from Markdown to JSON.
 * @param {string} str
 */
function md2JSON(str){
  var tree = markdown.parse(str);
  console.log('tree',tree);
  var res = {};
  elements = tree.slice(1);
  res.question = elements[0][2];
  res.choices = elements[1].slice(1).map(x => x[1]);
  res.correct = elements[2][2].split(',');
  return JSON.stringify(res);
}

/**
 * Return the list of files in the arguments dir and
 * subdirectories, identified by their relative path.
 * @param {string} dir 
 */
async function findMDFiles(dir) {
    let files = await fs.readdir(dir);

    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        if(stats.isDirectory()){
          return findMDFiles(filePath);
        }else if(stats.isFile()){
          return filePath;
        }
    }));

    let all = files.reduce((all, folderContents) => all.concat(folderContents), []);
    return all.filter( s => s.endsWith('.md'));
}

function changeFile(fileName){
  fs.readFile(fileName, {encoding: 'utf-8'})
  .then(fileContent => {
    console.log(fileName, md2JSON(fileContent));
    newFileName = fileName.substring(0, fileName.lastIndexOf('.')) + '.json'
    fs.writeFile(newFileName, md2JSON(fileContent), { encoding: 'utf-8' } );
    fs.unlink(fileName);
  });
}

findMDFiles(__dirname + '/json').then(function(filenameList){
  filenameList.map( changeFile );
});