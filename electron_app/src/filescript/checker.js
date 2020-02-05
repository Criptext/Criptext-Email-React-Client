const fs = require('fs');
const { remove } = require('./helpers');

const start = async () => {
  var args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1];
  const flagFilePath = `${inputPath}/../flag.txt`;

  if (!fs.existsSync(flagFilePath)) {
    await remove(outputPath);
    return;
  }

  await remove(inputPath);
  fs.renameSync(outputPath, inputPath);
  await remove(`${inputPath}/../flag.txt`);
};

start();
