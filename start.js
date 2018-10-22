#!/usr/bin/env node

const path = require('path')
const { spawn } = require('child_process')

const startDevServer = {
  cmd: 'node',
  args: ['node_modules/react-scripts/scripts/start.js']
}

const startCustomDevServer = {
  cmd: 'node',
  args: ['node_modules/@criptext/react-scripts/scripts/start.js']
}

const runSass = {
  cmd: 'node_modules/.bin/node-sass-chokidar',
  args: ['src', '-o', 'src', '--watch', '--recursive']
}

const abs = r => path.join(__dirname, r);

const tasks = [
  {
    ...startDevServer,
    cwd: abs('./email_composer'),
    env: {
      PORT: '3004',
    }
  },
  {
    ...runSass,
    cwd: abs('./email_composer')
  },
  {
    ...startDevServer,
    cwd: abs('./email_dialog'),
    env: {
      PORT: '3006',
    }
  },
  {
    ...runSass,
    cwd: abs('./email_dialog')
  },
  {
    ...startDevServer,
    cwd: abs('./email_loading'),
    env: {
      PORT: '3003',
    }
  },
  {
    ...runSass,
    cwd: abs('./email_loading')
  },
  {
    ...startCustomDevServer,
    cwd: abs('./email_login'),
    env: {
      PORT: '3005',
    }
  },
  {
    ...startDevServer,
    cwd: abs('./email_mailbox'),
    env: {
      PORT: '3000',
    }
  },
  {
    ...runSass,
    cwd: abs('./email_mailbox')
  }
]


const children = tasks.map(({ cmd, cwd, env, args }) => {
  const cp = spawn(cmd, args, { cwd, env });

  cp.on('close', (code) => {
    console.log(`Command "${cmd} ${args.join(' ')}" in "${cwd}" exited with status code: ${code}`)
  });

  return cp;
});

const electronApp = spawn('node_modules/.bin/electron', ['.'], {
    cwd: abs('./electron_app'),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      CSC_LINK: 'build/Certificates.p12',
      CSC_KEY_PASSWORD: 'xxxxxxxx',
      CSC_IDENTITY_AUTO_DISCOVERY: 'true',
      MAILBOX_URL: 'http://localhost:3000',
      DIALOG_URL: 'http://localhost:3006',
      LOGIN_URL: 'http://localhost:3005', 
      LOADING_URL: 'http://localhost:3003', 
      COMPOSER_URL:'http://localhost:3004'
    },
  })

electronApp.on('close', (code) => {
  console.log(`electron app exited with status code: ${code}`);
  children.forEach(c => c.kill());
  process.exit(1);
});

