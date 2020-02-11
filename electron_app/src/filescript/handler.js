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
  let failureCounter = 0;
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
          const result = await decryptEncryptStreamFile({
            inputFile: inPath,
            outputFile: outPath,
            password,
            oldPassword
          });
          if (!result) failureCounter++;
          if (failureCounter >= 10)
            throw new Error('Unable to handle 10 or more email bodies');
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

const start = async ({ inPath, outPath, pass, oldPass }) => {
  const inputPath = inPath;
  const outputPath = outPath;
  const password = pass;
  const oldPassword = oldPass;

  if (!fs.existsSync(inputPath)) return true;
  const success = await convertFilesInFolder(
    inputPath,
    outputPath,
    password,
    oldPassword
  );
  if (!success) {
    await remove(outPath);
    sendMessage('abort');
    return false;
  }
  await remove(inputPath);
  if (fs.existsSync(outputPath)) fs.renameSync(outputPath, inputPath);
  return true;
};

module.exports = {
  start
};
