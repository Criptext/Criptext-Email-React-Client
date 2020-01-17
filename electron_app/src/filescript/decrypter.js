const { decryptStreamFile } = require('./helpers');

const start = async () => {
  var args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1];
  const password = args[2];

  await decryptStreamFile({
    inputFile: inputPath,
    outputFile: outputPath,
    password
  });
};

start();
