import { myAccount, getContactsByEmailId } from './electronInterface';
import { getEmailByKey, getFilesByEmailId, getFileKeyByEmailId } from './ipc';
import {
  cleanHTML,
  removeActionsFromSubject,
  removeAppDomain
} from './StringUtils';
import { getFormattedDate } from './DateUtils';
import { appDomain, composerEvents } from './const';
import { FILE_MODES } from './FileUtils';
import { Status } from '../components/Control';

const filterNonCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) < 0);
};

const formAppSign = () => {
  return '<br/><span style="color:#000; font-size: 12px;">Sent with <a style="color: #0091ff; text-decoration: none;" href="https://goo.gl/qW4Aks">Criptext</a> secure email</span>';
};

const getCriptextRecipients = (recipients, type) => {
  return recipients
    .filter(email => email.indexOf(`@${appDomain}`) > 0)
    .map(email => ({
      recipientId: removeAppDomain(email),
      type
    }));
};

const getEmailAddressesFromEmailObject = emails => {
  return emails.map(item => item.email || item);
};

export const EmailStatus = {
  FAIL: 1,
  UNSENT: 2,
  NONE: 3,
  SENDING: 4,
  SENT: 5,
  DELIVERED: 6,
  READ: 7
};

export const formDataToEditDraft = async emailKeyToEdit => {
  const [emailData] = await getEmailByKey(emailKeyToEdit);
  const contacts = await getContactsByEmailId(emailData.id);
  const htmlBody = emailData.content;
  const textSubject = emailData.subject;
  const threadId = emailData.threadId;
  const toEmails = contacts.to.map(contact => contact.email);
  const ccEmails = contacts.cc.map(contact => contact.email);
  const bccEmails = contacts.bcc.map(contact => contact.email);

  return {
    toEmails,
    ccEmails,
    bccEmails,
    htmlBody,
    textSubject,
    threadId
  };
};

export const formOutgoingEmailFromData = ({
  bccEmails,
  body,
  ccEmails,
  files,
  iv,
  key,
  labelId,
  secure,
  status,
  textSubject,
  toEmails,
  threadId
}) => {
  const to = getEmailAddressesFromEmailObject(toEmails);
  const cc = getEmailAddressesFromEmailObject(ccEmails);
  const bcc = getEmailAddressesFromEmailObject(bccEmails);

  const criptextRecipients = [
    ...getCriptextRecipients(to, 'to'),
    ...getCriptextRecipients(cc, 'cc'),
    ...getCriptextRecipients(bcc, 'bcc')
  ];

  const externalRecipients = {
    to: filterNonCriptextRecipients(to),
    cc: filterNonCriptextRecipients(cc),
    bcc: filterNonCriptextRecipients(bcc)
  };

  const email = {
    key: Date.now(),
    subject: textSubject,
    content: secure ? body : `${body}${formAppSign()}`,
    preview: cleanHTML(body).slice(0, 100),
    date: Date.now(),
    status,
    unread: false,
    secure,
    isMuted: false,
    threadId
  };

  const from = myAccount.recipientId;
  const recipients = {
    to,
    cc,
    bcc,
    from: [`${from}@${appDomain}`]
  };

  const fileKeyParams = files.length && key && iv ? { key, iv } : null;

  const emailData = {
    email,
    recipients,
    labels: [labelId],
    fileKeyParams
  };

  return {
    emailData,
    criptextRecipients,
    externalRecipients,
    body: email.content
  };
};

const formReplyHeader = (date, from) => {
  const dateFormatted = getFormattedDate(date);
  return `<span>On ${dateFormatted}, ${from.name || ''} < ${
    from.email
  } > wrote: </span>`;
};

const formForwardHeader = (subject, date, from, to) => {
  const dateFormatted = getFormattedDate(date);
  const toFormatted = to.reduce((result, contact, index) => {
    if (index === 0) {
      return `${contact.name || ''} &lt;${contact.email}&gt;`;
    }
    return `${result}, ${contact.name || ''} &lt;${contact.email}&gt;`;
  }, '');
  return `<span>---------- Forwarded message ----------</span>
  ${insertEmptyLine(1)}
  <span>From: <b>${from.name || ''}</b> &lt;${from.email}&gt;</span>
  ${insertEmptyLine(1)}
  <span>Date: ${dateFormatted}</span>
  ${insertEmptyLine(1)}
  <span>Subject: ${subject}</span>
  ${insertEmptyLine(1)}
  <span>To: ${toFormatted}</span>
  ${insertEmptyLine(2)}
  `;
};

const insertEmptyLine = quantity => {
  return quantity > 0 ? '<br/>'.repeat(quantity) : '';
};

const formRecipientObject = contact => {
  return contact.name ? { name: contact.name, email: contact.email } : contact;
};

const formReplyForwardContent = (replyType, subject, date, from, to, body) => {
  let content = '';
  if (replyType === composerEvents.FORWARD) {
    content = `<section class="criptext_quote">${formForwardHeader(
      subject,
      date,
      from,
      to
    )}${body}</section>`;
  } else {
    content = `<section class="criptext_quote">${formReplyHeader(
      date,
      from
    )}<blockquote style="margin:10px 0 0 10px;padding-left: 10px;border-left:1px #0091ff solid;">${body}</blockquote></section>`;
  }

  return `${insertEmptyLine(2)}${content}${formSignature()}`;
};

export const formDataToReply = async (emailKeyToEdit, replyType) => {
  const emailIsForward = replyType === composerEvents.FORWARD;
  const [emailData] = await getEmailByKey(emailKeyToEdit);
  let files = [];
  let key = null,
    iv = null;
  if (emailIsForward) {
    const prevFiles = await getFilesByEmailId(emailData.id);
    files = prevFiles.map(file => {
      return {
        fileData: { ...file, type: file.mimeType },
        mode: FILE_MODES.UPLOADED,
        percentage: 100,
        token: file.token,
        shouldDuplicate: true
      };
    });
    const [fileKeyParams] = await getFileKeyByEmailId(emailData.id);
    if (fileKeyParams) {
      key = fileKeyParams.key;
      iv = fileKeyParams.iv;
    }
  }

  const threadId = emailIsForward ? undefined : emailData.threadId;
  const contacts = await getContactsByEmailId(emailData.id);
  const [from] = contacts.from;
  const content = formReplyForwardContent(
    replyType,
    emailData.subject,
    emailData.date,
    from,
    contacts.to,
    emailData.content
  );
  const htmlBody = content;
  const replySufix = 'RE: ';
  const forwardSufix = 'FW: ';
  const sufix = emailIsForward ? forwardSufix : replySufix;
  const textSubject = sufix + removeActionsFromSubject(emailData.subject);
  const myEmailAddress = `${myAccount.recipientId}@${appDomain}`;
  const toEmails = formToEmails(
    contacts.from,
    contacts.to,
    replyType,
    myEmailAddress
  );
  const previousCcEmails = filterRecipientObject(contacts.cc, myEmailAddress);
  const othersToEmails = filterRecipientObject(contacts.to, myEmailAddress);
  const ccEmails =
    replyType === composerEvents.REPLY_ALL
      ? [...previousCcEmails, ...othersToEmails]
      : [];

  const bccEmails = [];
  return {
    toEmails,
    ccEmails,
    bccEmails,
    htmlBody,
    textSubject,
    threadId,
    files,
    key,
    iv,
    status: emailIsForward ? Status.DISABLED : Status.ENABLED
  };
};

const formToEmails = (from, to, replyType, myEmailAddress) => {
  const [isFromMe] = from.map(
    contact =>
      contact.email
        ? contact.email === myEmailAddress
        : contact === myEmailAddress
  );
  if (
    replyType === composerEvents.REPLY ||
    replyType === composerEvents.REPLY_ALL
  ) {
    if (isFromMe) {
      return to.map(contact => formRecipientObject(contact));
    }
    return from.map(contact => formRecipientObject(contact));
  }
  return [];
};

const filterRecipientObject = (contacts, rejectEmailAddress) => {
  return contacts
    .map(contact => formRecipientObject(contact))
    .filter(contact => {
      return contact.email !== rejectEmailAddress;
    });
};

const formSignature = () => {
  const signature = myAccount.signatureEnabled
    ? `<br/><p>${myAccount.signature}</p>`
    : '';
  return signature;
};

export const formComposerDataWithSignature = () => {
  const content = formSignature();
  const htmlBody = content;

  return {
    htmlBody
  };
};

export const formNewEmailFromData = data => {
  const htmlBody = data.email.content;
  return {
    toEmails: data.recipients ? [formRecipientObject(data.recipients.to)] : [],
    textSubject: data.email.subject,
    htmlBody,
    status: data.status
  };
};

export const parseEmailAddress = emailAddressObject => {
  const email = emailAddressObject.email || emailAddressObject;
  const isEmailAddressFromAppDomain = email.indexOf(`@${appDomain}`) > 0;
  const parsedEmail = isEmailAddressFromAppDomain ? email.toLowerCase() : email;
  return { name: emailAddressObject.name, email: parsedEmail };
};
