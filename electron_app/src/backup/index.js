const { spawn } = require('child_process');
const { Worker } = require('worker_threads');
const path = require('path');

const exporterPath = path.join(__dirname, 'exporter.js');

const runBackup = dbPath => {
  return new Promise( (resolve, reject) => {
    const worker = new Worker(exporterPath, { 
      workerData: {
        dbPath
      }
    });

    worker.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);
      reject();
    });

    worker.on('error', (code) => {
      console.log(`child process exited with error ${code}`);
      reject();
    });

    worker.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve();
    });
  })
}

module.exports = {
  runBackup
};
