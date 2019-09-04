const fs = require('fs');
const path = require('path');
const Mbox = require('node-mbox');
const MailParser = require('mailparser').MailParser;
const { getBasepathAndFilenameFromPath } = require('./utils/stringUtils');
const ALLOWED_EXTENSIONS = ['.mbox'];

function checkEmailFileExtension(filepath) {
  const { filename } = getBasepathAndFilenameFromPath(filepath);
  if (!filename) return false;
  const ext = path.extname(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
}

const handleParseMailboxFile = filepath => {
  const check = checkEmailFileExtension(filepath);
  if (!check) {
    return { error: true, message: 'Unable to parse. Invalid file' };
  }
  return new Promise((resolve, reject) => {
    try {
      const inputStream = fs.createReadStream(filepath);
      const mboxparser = new Mbox();
      mboxparser.on('message', handleParseExternalEmail);
      mboxparser.on('error', mboxErr =>
        reject({ error: true, message: mboxErr })
      );
      mboxparser.on('end', () =>
        resolve({ error: false, message: 'File parsed successfully' })
      );
      inputStream.pipe(mboxparser);
    } catch (error) {
      reject({ error: true, message: error });
    }
  });
};

const handleParseExternalEmail = msg => {
  return new Promise((resolve, reject) => {
    const attachments = [];
    const mailparser = new MailParser({ streamAttachments: true });
    mailparser.on('headers', headers => {
      console.log(JSON.stringify(headers));
    });
    mailparser.on('data', data => {
      switch (data.type) {
        case 'text': {
          Object.keys(data).forEach(key => {
            console.log(`${key}: ${data[key]}`);
          });
          break;
        }
        case 'attachment': {
          attachments.push(data);
          data.chunks = [];
          data.chunklen = 0;
          Object.keys(data).forEach(key => {
            if (!['object', 'function'].includes(typeof data[key])) {
              console.log('%s: %s', key, JSON.stringify(data[key]));
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
          if (err) {
            console.log(err);
            reject(err);
          }
          if (html) {
            resolve('Ok');
          }
        }
      );
    });
    mailparser.write(msg);
    mailparser.end();
  });
};

module.exports = {
  handleParseMailboxFile
};
