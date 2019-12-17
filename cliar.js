function parseArgv(){
  const argsv = process.argv.slice(2);
  if(argsv.length === 0){
    process.exit(1);
  }
}