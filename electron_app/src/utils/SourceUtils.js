const fileUtils = require('./FileUtils');
const dbManager = require('../DBManager');
const myAccount = require('../Account');
const mySetting = require('../Settings');
const { APP_DOMAIN } = require('./const');
const { dialog, BrowserWindow } = require('electron');
const path = require('path');
const lang = require('./../lang');

const HTMLTagsRegex = /<[^>]*>?/g;
const getUsername = () => `${myAccount.recipientId}@${APP_DOMAIN}`;

const buildEmailSource = async ({ metadataKey }) => {
  const username = getUsername();
  const [email] = await dbManager.getEmailByKey(metadataKey);
  if (!email || !email.boundary) {
    throw 'Unable to build email source. No boundary found!';
  }
  const body = await fileUtils.getEmailBody({ username, metadataKey });
  const headers = await fileUtils.getEmailHeaders({ username, metadataKey });

  const source = `
${headers}

--${email.boundary}

Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

${cleanHTML(body)}

--${email.boundary}

Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

${body.replace(/[\n\r]/g, '')}

--${email.boundary}
  `;
  openWindowWithSource(source, email.subject);
};

const openWindowWithSource = (source, subject) => {
  let workerWin;
  try {
    // Send to hidden window for print
    const defaultDocumentName = subject;
    if (!workerWin) {
      workerWin = new BrowserWindow({ show: true });
    }
    workerWin.loadURL(
      path.join(
        'file://',
        __dirname,
        '..',
        'windows',
        `source-${mySetting.theme || 'light'}.html`
      )
    );
    workerWin.webContents.closeDevTools();
    workerWin.webContents.once('dom-ready', () => {
      workerWin.webContents.send('setContent', source, defaultDocumentName);
    });
  } catch (ex) {
    dialog.showErrorBox(lang.strings.errorMessages.SOURCE_ERROR);
  }
};

const cleanHTML = string => {
  const stringHTMLcontentRemoved = string
    .replace(/<style[^>]*>[^>]*<\/style>/g, '')
    .replace(/<script[^>]*>[^>]*<\/script>/g, '')
    .replace(/&nbsp;/, ' ');
  return removeHTMLTags(stringHTMLcontentRemoved);
};

const removeHTMLTags = string => {
  const stringHTMLTagRemoved = string.replace(HTMLTagsRegex, ' ');
  return stringHTMLTagRemoved.replace(/\s\s+/g, ' ').trim();
};

module.exports = {
  buildEmailSource
};
