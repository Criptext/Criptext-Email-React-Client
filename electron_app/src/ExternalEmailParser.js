const fs = require('fs');
const path = require('path');
const Mbox = require('node-mbox');
const MailParser = require('mailparser').MailParser;
const { getBasepathAndFilenameFromPath } = require('./utils/stringUtils');
const { databasePath } = require('./models');
const ALLOWED_EXTENSIONS = ['.mbox'];

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
  return new Promise(resolve => {
    let count = 0;
    const labelsFound = {};
    String.prototype.getBetween = function(prefix, suffix) {
      let s = this;
      let i = s.indexOf(prefix);
      if (i < 0) return '';
      s = s.substring(i + prefix.length);
      if (suffix) {
        i = s.indexOf(suffix);
        if (i < 0) return '';
        s = s.substring(0, i - 1);
      }
      return s;
    };
    // Check extension
    try {
      const check = checkEmailFileExtension(mboxFilepath);
      if (!check)
        resolve({ error: true, message: 'Unable to parse. Invalid file' });
    } catch (checkError) {
      return resolve({ error: true, message: checkError.toString() });
    }
    // Temp Directory
    try {
      checkTempDirectory(MODES.CREATE);
    } catch (tmpError) {
      return resolve({ error: true, message: 'Unable to check temp folder' });
    }
    // Split in files and count
    try {
      const inputStream = fs.createReadStream(mboxFilepath);
      const mboxparser = new Mbox();
      mboxparser.on('message', msg => {
        const labelsMatch = msg.toString().getBetween('X-Gmail-Labels: ', '\n');
        const externalLabels = `${labelsMatch || ''}`.split(',');
        for (const label of externalLabels) {
          labelsFound[label] = '';
        }
        try {
          const identifier = count + 1;
          const emailfolder = path.join(TempDirectory, `EXT${identifier}`);
          const rawEmailPath = path.join(emailfolder, `raw.txt`);
          fs.mkdirSync(emailfolder);
          fs.writeFileSync(rawEmailPath, msg);
          count++;
        } catch (saveEmailErr) {
          console.log('Failed to save email to file');
        }
      });
      mboxparser.on('error', mboxErr => {
        resolve({ error: true, message: mboxErr.toString() });
      });
      mboxparser.on('end', () => {
        resolve({ error: false, count, labels: Object.keys(labelsFound) });
      });
      inputStream.pipe(mboxparser);
    } catch (parseError) {
      resolve({ error: true, message: parseError.toString() });
    }
  });
};

// Parse One Email
const parseIndividualEmailFiles = async () => {
  try {
    if (fs.existsSync(TempDirectory)) {
      for (const folder of fs.readdirSync(TempDirectory)) {
        const subFolderPath = path.join(TempDirectory, folder);
        for (const email of fs.readdirSync(subFolderPath)) {
          // Just 1 file
          const emailPath = path.join(subFolderPath, email);
          const headersResponse = await getHeadersFromEmailFile(emailPath);
          if (!headersResponse.error) {
            const headersFilepath = path.join(subFolderPath, 'headers.txt');
            fs.writeFileSync(headersFilepath, headersResponse.message); // 2 files now
          }
          const bodyResponse = await parseEmailFromFile(emailPath);
          if (!bodyResponse.error) {
            const bodyFilepath = path.join(subFolderPath, 'body.txt');
            fs.writeFileSync(bodyFilepath, bodyResponse.message); // 3 files now
            console.log(bodyResponse.emailData);
          }
        }
      }
    }
  } catch (parseErr) {
    return { error: true, message: 'Failed to parse emails files' };
  }
};

const getHeadersFromEmailFile = pathtoemail => {
  const Splitter = require('mailsplit').Splitter;
  const splitter = new Splitter();
  const emailFileStream = fs.createReadStream(pathtoemail);
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
      resolve({ error: true, message: `Failed to split file: ${pathtoemail}` })
    );
    splitter.on('end', () => resolve({ error: false, message: headers }));
    emailFileStream.pipe(splitter);
  });
};

const parseEmailFromFile = pathtoemail => {
  return new Promise(resolve => {
    const handleError = err => {
      resolve({
        error: true,
        message: typeof err === 'string' ? err : err.toString()
      });
    };
    const handleSuccess = (body, emailData) => {
      resolve({ error: false, message: body, emailData });
    };
    try {
      const files = [];
      const labels = [];
      const recipients = [];
      let email;

      const inputStream = fs.createReadStream(pathtoemail);
      const mailparser = new MailParser({ streamAttachments: true });
      mailparser.on('headers', headers =>
        parseEmailHeaders(headers, labels, recipients)
      );
      mailparser.on('data', data => {
        const res = parseEmailData(data, files);
        email = { ...res };
      });
      mailparser.on('error', err => handleError(err.toString()));
      mailparser.on('end', () => {
        mailparser.updateImageLinks(
          (attachment, done) => {
            const type = attachment.contentType;
            const data = attachment.buf.toString('base64');
            done(false, `data:${type};base64,${data}`);
          },
          (err, html) => {
            if (err) return handleError(err.toString());
            if (html) {
              const emailData = {};
              emailData['email'] = email;
              if (files.length) emailData['files'] = files;
              if (labels.length) emailData['labels'] = labels;
              if (recipients.length) emailData['recipients'] = recipients;
              handleSuccess(html, emailData);
            }
          }
        );
      });
      inputStream.pipe(mailparser);
    } catch (parseFileErr) {
      handleError(parseFileErr.toString());
    }
  });
};

const parseEmailHeaders = headers => {
  for (const [clave, valor] of headers.entries()) {
    console.log('\x1b[36m%s\x1b[0m', `${clave} = ${valor}`);
  }
};

const parseEmailData = (data, attachmentsArray) => {
  let email;
  if (data.type === 'text') {
    Object.keys(data).forEach(key => {
      if (key === 'html') {
        email = data[key];
      }
      // console.log('\x1b[33m%s\x1b[0m', `${key} = ${data[key]}`);
    });
  } else if (data.type === 'attachment') {
    data.chunks = [];
    data.chunklen = 0;
    const fileDataObject = {
      token: '',
      status: 1,
      mimeType: 'application/octet-stream',
      name: 'unknown'
    };
    for (const key of Object.keys(data)) {
      const isObject = typeof data[key] === 'object';
      const isFunction = typeof data[key] === 'function';
      if (!isObject && !isFunction) {
        switch (key) {
          case 'filename':
            fileDataObject['name'] = data[key];
            break;
          case 'contentType':
            fileDataObject['mimeType'] = data[key];
            break;
          case 'size':
            fileDataObject['size'] = data[key];
            break;
          case 'cid':
            if (data[key] && !!data.related) {
              fileDataObject['cid'] = data[key];
            }
            break;
          default:
            break;
        }
      }
    }
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
      attachmentsArray.push(fileDataObject);
      console.log(
        '\x1b[32m%s\x1b[0m',
        `-----------------------------------
        ${JSON.stringify(fileDataObject)}
        -----------------------------------
      `
      );
    });
  }
  return email;
};

// Main
const handleParseMailboxFile = async filepath => {
  const splitResponse = await parseFileAndSplitEmailsInFiles(filepath);
  if (splitResponse.error) {
    console.log('Hubo un error');
    return null;
  }
  const { count, labels } = splitResponse;
  console.log(
    '\x1b[36m%s\x1b[0m',
    `[ Total de emails : ${count} ][ LabelsEnconrados: ${labels} ]`
  );
};

module.exports = {
  handleParseMailboxFile,

  parseIndividualEmailFiles
};
