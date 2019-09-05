const fs = require('fs');
const path = require('path');
const Mbox = require('node-mbox');
const MailParser = require('mailparser').MailParser;
const { getBasepathAndFilenameFromPath } = require('./utils/stringUtils');
const { databasePath } = require('./models');
const ALLOWED_EXTENSIONS = ['.mbox'];

let count = 0;

/*  Temp Directory
----------------------------- */
const TempFolderName = 'Imported';
const TempDirectory = path.join(databasePath, '..', TempFolderName);
const MODES = {
  CREATE: 'create',
  RESUME: 'resume'
};

const checkTempDirectory = mode => {
  try {
    if (mode === 'create') {
      if (fs.existsSync(TempDirectory)) {
        removeTempDirectoryRecursive(TempDirectory);
      }
      fs.mkdirSync(TempDirectory);
    }
  } catch (e) {
    throw new Error('Unable to check temp folder');
  }
};

const removeTempDirectoryRecursive = pathToDelete => {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach(file => {
      const currentPath = path.join(pathToDelete, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        removeTempDirectoryRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(pathToDelete);
  }
};

/*  Methods
----------------------------- */
function checkEmailFileExtension(filepath) {
  const { filename } = getBasepathAndFilenameFromPath(filepath);
  if (!filename) return false;
  const ext = path.extname(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
}

const parseFileAndSplitEmailsInFiles = mboxFilepath => {
  return new Promise((resolve, reject) => {
    const handleError = err => {
      reject({
        error: true,
        message: typeof err === 'string' ? err : err.toString()
      });
    };
    const handleSuccess = () => {
      resolve({ error: false, message: count });
    };

    try {
      const check = checkEmailFileExtension(mboxFilepath);
      if (!check) handleError('Unable to parse. Invalid file');
    } catch (checkError) {
      handleError(checkError);
    }

    try {
      checkTempDirectory(MODES.CREATE);
    } catch (tmpError) {
      handleError('Unable to check temp folder');
    }

    try {
      const inputStream = fs.createReadStream(mboxFilepath);
      const mboxparser = new Mbox();
      mboxparser.on('message', saveEmailInTempFile);
      mboxparser.on('error', handleError);
      mboxparser.on('end', handleSuccess);
      inputStream.pipe(mboxparser);
    } catch (parseError) {
      handleError(parseError);
    }
  });
};

const saveEmailInTempFile = msg => {
  try {
    const identifier = Date.now();
    const emailfolder = path.join(TempDirectory, `Imp${identifier}`);
    const filepath = path.join(emailfolder, `${identifier}.txt`);
    fs.mkdirSync(emailfolder);
    fs.writeFileSync(filepath, msg);
    count++;
  } catch (error) {
    count++;
  }
};

const parseIndividualEmailFiles = async () => {
  try {
    if (fs.existsSync(TempDirectory)) {
      for (const folder of fs.readdirSync(TempDirectory)) {
        const subFolderPath = path.join(TempDirectory, folder);
        for (const email of fs.readdirSync(subFolderPath)) {
          const emailPath = path.join(subFolderPath, email);
          const headersResponse = await getHeadersFromEmailFile(emailPath);
          if (!headersResponse.error) {
            const headersFilepath = path.join(subFolderPath, 'headers.txt');
            fs.writeFileSync(headersFilepath, headersResponse.message);
          }
        }
      }
    }
  } catch (parseErr) {
    return { error: true, message: 'Failed to parse emails files' };
  }
};

const getHeadersFromEmailFile = emailtopath => {
  const Splitter = require('mailsplit').Splitter;
  const splitter = new Splitter();
  const emailFileStream = fs.createReadStream(emailtopath);
  let headers;
  let isFirst = true;
  return new Promise(resolve => {
    splitter.on('data', data => {
      if (data.type === 'node' && isFirst) {
        headers = `${data.getHeaders()}`;
        isFirst = false;
      }
    });
    splitter.on('error', () =>
      resolve({ error: true, message: `Failed to split file: ${emailtopath}` })
    );
    splitter.on('end', () => resolve({ error: false, message: headers }));
    emailFileStream.pipe(splitter);
  });
};

const handleParseExternalEmail = msg => {
  return new Promise((resolve, reject) => {
    const attachments = [];
    const mailparser = new MailParser({ streamAttachments: true });
    mailparser.on('headers', headers => {
      for (const [clave, valor] of headers.entries()) {
        console.log(clave + ' = ' + `${valor.slice(0, 10)}...`);
      }
    });
    mailparser.on('data', data => {
      switch (data.type) {
        case 'text': {
          Object.keys(data).forEach(key => {
            console.log(key + ' = ' + `${data[key].slice(0, 10)}...`);
          });
          break;
        }
        case 'attachment': {
          attachments.push(data);
          data.chunks = [];
          data.chunklen = 0;
          Object.keys(data).forEach(key => {
            if (!['object', 'function'].includes(typeof data[key])) {
              console.log(
                '%s = %s',
                key,
                JSON.stringify(data[key]).slice(0, 10)
              );
            }
          });
          data.content.on('readable', () => {
            let chunk;
            while ((chunk = data.content.read()) !== null) {
              data.chunks.push(chunk);
              data.chunklen += chunk.length;
            }
          });
          data.content.on('end', () => {
            data.buf = Buffer.concat(data.chunks, data.chunklen);
            data.release();
          });
          break;
        }
        default:
          break;
      }
    });
    mailparser.on('error', err => reject(err));
    mailparser.on('end', () => {
      mailparser.updateImageLinks(
        (attachment, done) => {
          const type = attachment.contentType;
          const data = attachment.buf.toString('base64');
          done(false, `data:${type};base64,${data}`);
        },
        (err, html) => {
          if (err) return reject(err);
          if (html) resolve('Ok');
        }
      );
    });
    mailparser.write(msg);
    mailparser.end();
  });
};

const handleParseMailboxFile = async filepath => {
  const { error, message } = await parseFileAndSplitEmailsInFiles(filepath);
  if (error) return;
  console.log('> Total de emails: ', message);
  await parseIndividualEmailFiles();
};

module.exports = {
  handleParseMailboxFile,
  handleParseExternalEmail
};
