//@ts-check

const colors = require('colors');

/**
 * @typedef {Object} quizItem
 * @property {string} question
 * @property {string[]} choices
 * @property {number[]} correct
 */


/**
 * Create the string representation of the appscript
 * command to create the form's title.
 * @param {string} title
 * @returns string
 */
function prolog(title){
  return `  var form = FormApp.create('${title}');\n`;
}


const epilog = ``+
`  Logger.log('Published URL: ' + form.getPublishedUrl());\n`+
`  Logger.log('Editor URL:    ' + form.getEditUrl());\n`;


function createChoice(choiceString, isCorrect){
  return {
    value: choiceString,
    isCorrect: isCorrect
  }
}


function annotateChoices(choices, correctIndices){
  let correct = new Set(correctIndices);
  return choices.map( (choice, i) => {
    return createChoice(choice, correct.has(i+1))
  })
}


function createItemChoices(choices, correct){
  let choicesO = annotateChoices(choices, correct);
  let i = 0;
  return choicesO.map( (choiceO) => {
    if(choiceO.isCorrect){
      return `    item.createChoice("${choiceO.value}", true),\n`.green;
    }else{
      return `    item.createChoice("${choiceO.value}", false),\n`.red;
    }
  })
}


/**
 * Maps a JSON quiz item to a appscript MultipleChoiceItem.
 * @param {quizItem} quizItem
 * @returns string
 */
function quizItemToMultipeChoice(quizItem, itemNum){
  const choiceList = createItemChoices(quizItem.choices, quizItem.correct);
  const choiceString = choiceList.reduce( (x, y) => x+y);
  return `  item = form.addMultipleChoiceItem();\n`+
  `  item.setTitle("${quizItem.question}");\n`+
  `  item.setChoices([\n`+
  createItemChoices(quizItem.choices, quizItem.correct).reduce( (x, y) => x+y)+
  `  ])`;
}


function createForm(name, items){
  const content = items.map(quizItemToMultipeChoice);
  let contentS = content.join(';\n');
  return `function createForm(){\n${prolog(name)}${contentS}\n${epilog}\n}`;
}


module.exports = {
  createForm: createForm
}
