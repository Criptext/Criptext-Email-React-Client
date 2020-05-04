#!/usr/bin/env node

const path = require('path')
const { spawn } = require('child_process')

const abs = r => path.join(__dirname, r);

const packageDirs = [
  abs('email_composer'),
  abs('email_loading'),
  abs('email_login'),
  abs('email_mailbox'),
  abs('email_pin'),
  abs('electron_app')
]

const installModules = cwd => 
  new Promise((resolve, reject) =>  {
    const cp = spawn('yarn', [], { cwd });
    const names = cwd.split('/');
    const nameProject = names[names.length-1];
    cp.on('exit', code => {
      code == 0
        ? resolve(`Project ${nameProject} installed ...wait`) 
        : reject(` Failed to install modules at ${cwd}.\n Yarn exited with code: ${code}`)
    });
  }).then(value => {console.log(value)});

const installations = Promise.all(packageDirs.map(installModules));

installations.then(
  () => console.log('Installed modules successfully!'), 
  err => console.error(err)
);
