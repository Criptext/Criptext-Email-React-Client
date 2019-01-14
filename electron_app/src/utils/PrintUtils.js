const { dialog, BrowserWindow } = require('electron');
const {
  defineLargeTime,
  cleanEmojisFromString,
  formatRecipientsToPrint,
  printDocumentTemplateClose,
  printDocumentTemplateHeader,
  cleanHTMLTagsFromEmailContentToPrint
} = require('./stringUtils');
const lang = require('./../lang');
const dbManager = require('./../DBManager');
const path = require('path');

const printEmailOrThread = async ({ emailId, threadId }) => {
  let workerWin;
  // Refresh lang for document header
  const { language } = require('./../Settings');
  lang.setLanguage(language);

  const localizedToTag = lang.strings.printStrings.toTag;
  const localizedMessageTag = lang.strings.printStrings.message;

  const formDocumentHeader = (subject, numEmails) => {
    const logoPath = path.join(
      'file://',
      __dirname,
      '..',
      '..',
      'build',
      'criptext-logo-complete.png'
    );
    const logo = `
      <img src="${logoPath}" alt="Criptext Logo" style="width: 100px !important;">
      <hr>`;
    const generalInfo = `
      <table style="width:100%">
        <tr>
          <td><b>${subject}</b></td>
        </tr>
        <tr>
          <td>${numEmails} ${localizedMessageTag}${numEmails > 1 ? 's' : ''}<td>
        </tr>
      </table>
      <hr>`;
    return printDocumentTemplateHeader + logo + generalInfo;
  };

  const formatEmailContent = (
    fromName,
    fromMail,
    date,
    recipients,
    content
  ) => {
    return `
      <table style="width:100%">
        <tr>
          <td>${
            fromName
              ? `<b>${fromName}</b> &lt;${fromMail}&gt;`
              : `<b>${fromMail}</b>`
          }</td>
          <td style="text-align:right">
            ${defineLargeTime(date, language)}
          </td>
        </tr>
        <tr>
          <td>${localizedToTag}: ${formatRecipientsToPrint(recipients)}</td>
        </tr>
      </table><br>
      <div class="printint-pdf-document-email-content">${content}</div>`;
  };

  // Document variables
  let documentContent;
  let clearSubject;

  if (threadId) {
    const emails = await dbManager.getEmailsByThreadId(threadId);
    if (emails.length) {
      clearSubject = cleanEmojisFromString(emails[0].subject);
      const emailsContents = await Promise.all(
        emails.map(async email => {
          const [from] = await dbManager.getContactByIds([email.from]);
          const [fromName, fromMail] = [from.name, from.email];
          const to = await dbManager.getContactByIds(email.to.split(','));
          let cc = [];
          if (email.cc) {
            cc = await dbManager.getContactByIds(email.cc.split(','));
          }
          const emailContent = cleanHTMLTagsFromEmailContentToPrint(
            email.content
          );
          return formatEmailContent(
            fromName,
            fromMail,
            email.date,
            [...to, ...cc],
            emailContent
          );
        })
      );
      documentContent =
        formDocumentHeader(clearSubject, emails.length) +
        emailsContents.join('<br/><hr>') +
        printDocumentTemplateClose;
    }
  } else if (emailId) {
    const [email] = await dbManager.getEmailsByIds([emailId]);
    if (email) {
      const { to, cc, from } = await dbManager.getContactsByEmailId(email.id);
      const [fromName, fromMail] = [from[0].name, from[0].email];
      const emailContent = cleanHTMLTagsFromEmailContentToPrint(email.content);
      clearSubject = cleanEmojisFromString(email.subject);
      documentContent =
        formDocumentHeader(clearSubject, 1) +
        formatEmailContent(
          fromName,
          fromMail,
          email.date,
          [...to, ...cc],
          emailContent
        ) +
        printDocumentTemplateClose;
    }
  }

  try {
    // Send to hidden window for print
    const defaultDocumentName = clearSubject.split(' ').join('-');
    if (!workerWin) {
      workerWin = new BrowserWindow({ show: false });
    }
    workerWin.loadURL(
      path.join('file://', __dirname, '..', 'windows', 'worker.html')
    );
    workerWin.webContents.closeDevTools();
    workerWin.webContents.once('dom-ready', () => {
      workerWin.webContents.send(
        'setPdfContent',
        documentContent,
        defaultDocumentName
      );
    });
    workerWin.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        workerWin.webContents.print({ printBackground: true }, successPrint => {
          if (!successPrint) {
            dialog.showErrorBox(lang.strings.errorMessages.PRINTING_ERROR);
          }
          workerWin.close();
        });
      }, 2000);
    });
  } catch (printErr) {
    dialog.showErrorBox(lang.strings.errorMessages.PRINTING_ERROR);
  }
};

module.exports = { printEmailOrThread };
