//@ts-check


/**
 * @typedef {Object} quizItem
 * @property {string} question
 * @property {string[]} choices
 * @property {number[]} correct
 */


// npm packages
// markdown has brain damage.
// @ts-ignore
const mdParse = require("markdown").markdown.parse;
const fs = require('fs').promises;
// Local files
const msg = require('./msg');
const logger = require('./log').logger;
const clipboardy = require('clipboardy');
const createForm = require('./appscript').createForm;
let messages;
let log;


const setMessages = (m) => messages = m;


const now = () => (new Date()).toISOString;

 /**
  * Shows the traditional usage string with switches and
  * arguments and quits. This is used for missing or
  * ambiguous agv[]s. The process exits and returns a
  * non zero value to indicate failure.
  * @returns void
  */
function showUsageAndQuit(){
  console.log('usage: node index.js [-v | --verbose] (--quiz | -q) quizDir');
  process.exit(1);
}


function parseArgs(args){
  /**
   * @todo automate this form description
   */
  const switches = new Set(['v', 'verbose']);
  const isShortOpt = (s) => /^-\w+$/.test(s);
  const isLongOpt  = (s) => /^--\w+$/.test(s);
  const l = args.length;
  if(l === 0 || l > 3){
    showUsageAndQuit();
  }
  let res = { verbose: false };
  if(l === 3){
    if(args[0] === '--verbose' || args[0] === '-v'){
      res.verbose = true;
      res.quizDir = args[1];
      res.quizNum = args[2];
    }else{
      showUsageAndQuit();
    }
  }else{
    res.quizDir = args[0];
    res.quizNum = args[1];
  }
  return res;
}


/**
 * Convert a quiz question from Markdown to JSON.
 * @param {string} str
 * @returns {quizItem}
 */
function md2JSON(str){
  // @ts-ignore
  log('Parsing md string');
  var tree = mdParse(str);
  var res = {};
  // remove zeroth element: is always 'markdown'
  const elements = tree.slice(1);
  if(elements.length !== 3){
    log('MD file brain d34d');
    log('str' + str);
    log('elements' + elements)
    process.exit(1);
  }
  let mdHeaders = elements.map(x => x[0]);
  if(mdHeaders[0] !== 'header' ||
      mdHeaders[1] !== 'bulletlist' ||
      mdHeaders[2] !== 'header'){
    process.exit(1);
  }
  res.question = elements[0][2];
  res.choices = elements[1].slice(1).map(x => x[1]);
  res.correct = elements[2][2].split(',');
  res.correct = res.correct.map( x => Number(x) );
  return res;
}


/**
 * Predicate returning whether the files ends in (.md |
 * .markdown) or not.
 * @param {string} filename 
 * @returns {boolean} - whether the file ends in .markdown
 * or not
 */
function hasMDExtension(filename){
  log(`Checking extension on ${filename}`);
  return filename.endsWith('.md') ||
  filename.endsWith('.markdown');
}


/**
 * Return a function the adds the string <prefix> to its
 * own <string[]> arguments
 * @param {string} prefix 
 */
function prefixer(prefix){
  /**
   * @param {string[]} strings 
   * @returns {Promise<string[]>}
   */
  let _ = async function(strings){
    log(`Adding prefix "${prefix}" to strings`);
    return strings.map( s => prefix + s)
  };
  return _;
}


/**
 * Takes a dir as string and returns a list of all
 * files directly under that dir.
 * @param {string} dir 
 * @returns {Promise<string[]>}
 */
async function listFilesInDir(dir){
  log(`Listing files in ${dir}`);
  try{
    return fs.readdir(dir);
  } catch (err) {
    throw new Error(err);
  }
}


/**
 * 
 * @param {string[]} files - a list of filenames
 * @returns {Promise<string[]>}
 */
async function filterFiles(files){
  log('Filtering files')
  return files.filter(hasMDExtension);
}


/**
 * Reads the file <file> as a utf-8 encoded text file.
 * Eventually returns a string representing the content.
 * @param {string} file
 * @returns {Promise<string>}
 */
function readTextFile(file){
  log(`reading ${file}`);
  return fs.readFile(file, 'utf-8');
}


/**
 * Reads the files in the files array and eventually
 * returns a list of their textual content
 * @param {string[]} files - filenames
 * @returns {Promise<string[]>} - Eventually, String.s
 */
async function readFiles(files){
  log('Reading markdown quiz files')
  return Promise.all(
    files.map(readTextFile)
  )
}


/**
 * Takes an array of raw strings representing markdown
 * quizzes, parse those and transforms the resulting
 * object into JSON
 * @param {string[]} mdTexts - strings representing raw
 * contents of markdown files
 * @returns {Promise<Object[]>} 
 */
async function mdTextsToJSONs(mdTexts){
  log('Converting md strings to JSON');
  return mdTexts.map(md2JSON);
}


async function logAndCopy(quizString){
  console.log();
  console.log(quizString);
  console.log();
  const quizArray = quizString.split('');
  const reColourHack = /\u001b\[3\dm/g;
  const removeHack = (s) => s.replace(reColourHack, '');
  log('Copying appscript to clipboard')
  clipboardy.write(removeHack(quizString));
  log('Appscript in clipboard')
}


function main(quizDir, quizName){
  listFilesInDir(quizDir)
  .then( (files) => filterFiles(files) )
  .then( (mds) => prefixer(quizDir)(mds) )
  .then( (mdFiles) => readFiles(mdFiles) )
  .then( (mdTexts) => mdTextsToJSONs(mdTexts) )
  .then( _ => logAndCopy(createForm(quizName, _)))
  .catch( (err) => {
    log(messages.quizNotFound);
    process.exit(1);
  })
}


function init(){

  let argsO;
  let args = process.argv.slice(2);

  argsO = parseArgs(args);
  const quizDir = `./md/${argsO.quizDir}/`
  const quizName = `${argsO.quizDir} / Promo ${argsO.quizNum}`
  const prefix = prefixer(quizDir);
  log = logger(argsO['verbose']);
  msg.getMessages()
  .then( (msgO) => {
    setMessages(msgO);
    main(quizDir, quizName);
  })
  .catch( (error) => {
    console.log('Could not read messages.json', error);
  });
  
}


if (require.main === module) {
  init();
}