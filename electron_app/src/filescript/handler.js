const fs = require('fs');
const path = require('path');
const {
  remove,
  encryptStreamFile,
  decryptEncryptStreamFile,
  fileStat,
  readDir,
  sendMessage
} = require('./helpers');

const convertFilesInFolder = async (
  inputPath,
  outputPath,
  password,
  oldPassword
) => {
  try {
    const files = await readDir(inputPath);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inPath = path.join(inputPath, file);
      const outPath = path.join(outputPath, file);
      const stat = await fileStat(inPath);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
      }

      if (stat.isDirectory()) {
        await convertFilesInFolder(inPath, outPath, password, oldPassword);
      } else {
        if (stat.size === 0) {
          fs.closeSync(fs.openSync(outPath, 'w'));
        } else if (oldPassword) {
          await decryptEncryptStreamFile({
            inputFile: inPath,
            outputFile: outPath,
            password,
            oldPassword
          });
        } else {
          await encryptStreamFile({
            inputFile: inPath,
            outputFile: outPath,
            password
          });
        }
      }
    }
  } catch (ex) {
    console.error(ex);
    return false;
  }
  return true;
};

const createFlagFile = path => {
  const writer = fs.createWriteStream(path);
  writer.write('ready');
};

const start = async () => {
  var args = process.argv.slice(2);
  const inputPath = args[0];
  const outputPath = args[1];
  const password = args[2];
  const oldPassword = args[3];

  const success = await convertFilesInFolder(
    inputPath,
    outputPath,
    password,
    oldPassword
  );
  if (!success) {
    sendMessage('abort');
  }
  createFlagFile(`${inputPath}/../flag.txt`);
  await remove(inputPath);
  fs.renameSync(outputPath, inputPath);
  await remove(`${inputPath}/../flag.txt`);
};

start();
