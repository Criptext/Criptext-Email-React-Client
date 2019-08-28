const moment = require('moment');
const lang = require('./../lang');
const myAccount = require('./../Account');
const { APP_DOMAIN } = require('./../utils/const');

const removeProtocolFromUrl = (protocol, url) => {
  return url.replace(protocol, '');
};

const printDocumentTemplateHeader = `
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <style>
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Heavy.otf) format("opentype");font-weight:900;font-style:normal}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Heavy+Italic.otf) format("opentype");font-weight:900;font-style:italic}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Bold.otf) format("opentype");font-weight:800;font-style:normal}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Bold+Italic.otf) format("opentype");font-weight:800;font-style:italic}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Demi+Bold.otf) format("opentype");font-weight:700;font-style:normal}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Demi+Bold+Italic.otf) format("opentype");font-weight:700;font-style:italic}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Medium.otf) format("opentype");font-weight:600;font-style:normal}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Medium+Italic.otf) format("opentype");font-weight:600;font-style:italic}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Regular.otf) format("opentype");font-weight:400;font-style:normal}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Italic.otf) format("opentype");font-weight:400;font-style:italic}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Ultra+Light.otf) format("opentype");font-weight:300;font-style:normal}
      @font-face{font-family:Avenir Next;src:url(https://cdn.criptext.com/Criptext-Email-Website/fonts/Avenir+Next+Ultra+Light+Italic.otf) format("opentype");font-weight:300;font-style:italic}
      
      *, p {
        font-family: 'Avenir Next';
        font-size: 10px !important;
      };
      .printint-pdf-document-email-content {
        padding: 0px 30px;
      }
    </style>
  </head>
  <body style="margin: 0px 15px 15px 15px !important;">`;

const printDocumentTemplateClose = `</body></html>`;

const cleanHTMLTagsFromEmailContentToPrint = emailContent =>
  emailContent
    .replace('<html>', '')
    .replace('</html>', '')
    .replace('<head>', '')
    .replace('</head>', '');

const cleanEmojisFromString = string =>
  string
    .replace(
      /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
      ''
    )
    .trim();

const formatRecipientsToPrint = recipientsArray => {
  return recipientsArray
    .map(
      recipient =>
        recipient.name
          ? `${recipient.name} &lt;${recipient.email}&gt;`
          : `${recipient.email}`
    )
    .join(', ');
};

const defineLargeTime = (time, optionalLanguage) => {
  if (optionalLanguage) {
    moment.locale(optionalLanguage);
  }
  const localizedAt = lang.strings.printStrings.at;
  return moment(time).format(`ddd, D MMM YYYY [${localizedAt}] h:mm A`);
};

const removeLast = (myString, lastWord) => {
  if (myString.indexOf(lastWord) !== myString.length - lastWord.length) {
    return myString;
  }
  return myString.slice(0, myString.length - lastWord.length);
};

const genUUID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  );
};

const getUsername = () => {
  const username = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${APP_DOMAIN}`;
  return username;
};

const getBasepathAndFilenameFromPath = path => {
  const lastSepIndex =
    path.lastIndexOf('/') > 1 ? path.lastIndexOf('/') : path.lastIndexOf('\\');
  if (lastSepIndex < 1) {
    return { basename: undefined, filename: undefined };
  }
  const [basename, filename] = [
    path.substring(0, lastSepIndex),
    path.substring(lastSepIndex + 1)
  ];
  return { basename, filename };
};

module.exports = {
  removeLast,
  removeProtocolFromUrl,
  printDocumentTemplateClose,
  printDocumentTemplateHeader,
  cleanHTMLTagsFromEmailContentToPrint,
  getBasepathAndFilenameFromPath,
  formatRecipientsToPrint,
  cleanEmojisFromString,
  defineLargeTime,
  getUsername,
  genUUID
};
