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
  if (!fs.existsSync(inPath)) return true;
  const success = await convertFilesInFolder(inPath, outPath, pass, oldPass);
  if (!success) {
    await remove(outPath);
    sendMessage('abort');
    return false;
  }
  await remove(inPath);
  if (fs.existsSync(outPath)) fs.renameSync(outPath, inPath);
  return true;
};

const startAll = async ({ paths, pass, oldPass }) => {
  let pathMap;
  let success = 0;
  for (pathMap of paths) {
    if (!fs.existsSync(pathMap.inPath)) return true;
    const result = await convertFilesInFolder(
      pathMap.inPath,
      pathMap.outPath,
      pass,
      oldPass
    );
    if (result) success++;
  }

  if (success !== paths.length) {
    await Promise.all(paths.map(pathMap => remove(pathMap.outPath)));
    sendMessage('abort');
    return false;
  }
  await Promise.all(paths.map(pathMap => remove(pathMap.inPath)));
  for (pathMap of paths) {
    if (!fs.existsSync(pathMap.outPath)) continue;
    fs.renameSync(pathMap.outPath, pathMap.inPath);
  }

  return true;
};

module.exports = {
  start,
  startAll
};
