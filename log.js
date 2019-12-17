
function mylog(args){
  let xs = Array.prototype.slice.call(arguments);
  let d = (new Date()).toISOString();
  xs.splice(0, 0, `[${d}]`);
  console.log.apply(null, xs);
}


function logger(verbosity){
  if(verbosity){
    return mylog;
  }else{
    return () => Function.prototype;
  }
}

module.exports = {
  logger: logger
}