//@ts-check
const fs = require('fs').promises;

/**
 * 
 * @param {string} lang 
 * @param {object} messages
 */
function resolveLang(lang, messages){
  if(lang in messages){
    return messages[lang];
  }else if(lang.split('_')[0] in messages){
    return messages[lang.split('_')[0]];
  }else{
    return messages[messages.default];
  }
}


/**
 * Locate appropriate strings in a json file.
 * 
 * The target language is obtained from process.env.LANG.
 * 
 * LANG gives e.g. fr_FR.UTF-8, following ISO/IEC 15897:
 * [language[_territory][.codeset][@modifier]]
 * @param {boolean} [verbose=false] - Print information or not.
 * Defaults to false
 */
function getMessages(verbose){
  const locale = process.env.LANG;
  /**
   * @type {string} lang - the language[_territory] part of LANG
   */
  const lang = locale.slice(0, locale.indexOf('.'));
  verbose = Boolean(verbose);
  return new Promise( (resolve, reject) => {
    let messages;
    fs.readFile('messages.json', {encoding: 'utf-8'})
      .then( (fileContent) => {
        messages = JSON.parse(fileContent);
        resolve(resolveLang(lang, messages));
      })
      .catch( (error) => {
        reject(error);
      })
  });
}


module.exports = {
  getMessages
};
