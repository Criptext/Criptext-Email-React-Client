const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');

const exporterPath = path.join(__dirname, 'exporter.js');

const getTempDirectory = nodeEnv => {
  const folderName = 'BackupTempData';
  const currentDirToReplace =
    process.platform === 'win32' ? '\\src\\database' : '/src/database';
  switch (nodeEnv) {
    case 'development': {
      return path.join(__dirname, `../../${folderName}`);
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, folderName)
        .replace('/app.asar', '')
        .replace(currentDirToReplace, '');
    }
  }
};

const runBackup = (
  { dbPath, outputPath, key, recipientId, password },
  progressCallback
) => {
  const tempDir = getTempDirectory();
  return new Promise((resolve, reject) => {
    let backupSize = 0;
    const worker = spawn(
      'node',
      [exporterPath, dbPath, outputPath, recipientId, tempDir],
      {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      }
    );

    worker.on('message', data => {
      console.log(`message: ${JSON.stringify(data)}`);
      if (data.step === 'progress') progressCallback(data);
      if (data.step === 'end') backupSize = data.backupSize;
    });

    worker.on('error', code => {
      console.log(`child process exited with error ${code}`);
      reject(code);
    });

    worker.on('close', code => {
      console.log(`child process closed with code ${code}`);
      resolve(backupSize);
    });

    worker.send({
      step: 'init',
      key,
      password
    });
  });
};

module.exports = {
  runBackup
};
