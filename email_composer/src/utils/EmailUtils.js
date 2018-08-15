import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import {
  removeAppDomain,
  removeHTMLTags,
  replaceAllOccurrences,
  removeActionsFromSubject
} from './StringUtils';
import { getFormattedDate } from './DateUtils';
import { appDomain } from './const';
import {
  composerEvents,
  myAccount,
  getEmailByKey,
  getContactsByEmailId
} from './electronInterface';

const formRecipients = recipients => {
  return [
    ...getCriptextRecipients(recipients.to, 'to'),
    ...getCriptextRecipients(recipients.cc, 'cc'),
    ...getCriptextRecipients(recipients.bcc, 'bcc')
  ];
};

const getCriptextRecipients = (recipients, type) => {
  return recipients
    .filter(email => email.indexOf(`@${appDomain}`) > 0)
    .map(email => ({
      recipientId: removeAppDomain(email),
      type
    }));
};

const getNonCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) < 0);
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

const getEmailAddressesFromEmailObject = emails => {
  return emails.map(item => item.email || item);
};

export const formOutgoingEmailFromData = (composerData, labelId) => {
  const toEmails = getEmailAddressesFromEmailObject(composerData.toEmails);
  const ccEmails = getEmailAddressesFromEmailObject(composerData.ccEmails);
  const bccEmails = getEmailAddressesFromEmailObject(composerData.bccEmails);
  const recipients = {
    to: toEmails,
    cc: ccEmails,
    bcc: bccEmails
  };

  const criptextRecipients = formRecipients(recipients);

  const externalRecipients = {
    to: getNonCriptextRecipients(toEmails),
    cc: getNonCriptextRecipients(ccEmails),
    bcc: getNonCriptextRecipients(bccEmails)
  };

  const subject = composerData.textSubject;
  const body = draftToHtml(
    convertToRaw(composerData.htmlBody.getCurrentContent())
  );

  const email = {
    key: Date.now(),
    subject,
    content: body,
    preview: removeHTMLTags(body).slice(0, 21),
    date: Date.now(),
    status: EmailStatus.SENDING,
    unread: false,
    secure: true,
    isMuted: false,
    threadId: composerData.threadId
  };
  const from = myAccount.recipientId;
  recipients.from = [`${from}@${appDomain}`];

  const fileKeyParams = composerData.files.length
    ? { key: composerData.key, iv: composerData.iv }
    : null;

  const data = {
    email,
    recipients,
    labels: [labelId],
    fileKeyParams
  };
  return {
    data,
    criptextRecipients,
    externalRecipients,
    subject,
    body
  };
};

export const formDataToEditDraft = async emailKeyToEdit => {
  const [emailData] = await getEmailByKey(emailKeyToEdit);
  const contacts = await getContactsByEmailId(emailData.id);

  const blocksFromHtml = htmlToDraft(emailData.content);
  const { contentBlocks, entityMap } = blocksFromHtml;
  const contentState = ContentState.createFromBlockArray(
    contentBlocks,
    entityMap
  );
  const htmlBody = EditorState.createWithContent(contentState);
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

const formReplyHeader = (date, from) => {
  const emailDate = new Date(date);
  const { monthName, day, year, strTime, diff } = getFormattedDate(emailDate);
  return `<p>On ${monthName} ${day}, ${year}, ${strTime} ${diff}, ${from.name ||
    ''} < ${from.email} > wrote: </p><br>`;
};

const insertEmptyLine = quantity => {
  return quantity > 0 ? '<p></p>'.repeat(quantity) : '';
};

const formRecipientObject = contact => {
  return contact.name ? { name: contact.name, email: contact.email } : contact;
};

export const formDataToReply = async (emailKeyToEdit, replyType) => {
  const [emailData] = await getEmailByKey(emailKeyToEdit);
  const threadId =
    replyType === composerEvents.FORWARD ? undefined : emailData.threadId;
  const contacts = await getContactsByEmailId(emailData.id);
  const [from] = contacts.from;

  const firstLine = formReplyHeader(emailData.date, from);
  const newContent = `${firstLine}${emailData.content}`;

  let content = replaceAllOccurrences(newContent, '<p>', '<blockquote>');
  content = replaceAllOccurrences(content, '</p>', '</blockquote>');
  content = `${insertEmptyLine(2)}${content}`;

  const blocksFromHtml = htmlToDraft(content);
  const { contentBlocks, entityMap } = blocksFromHtml;
  const contentState = ContentState.createFromBlockArray(
    contentBlocks,
    entityMap
  );
  const htmlBody = EditorState.createWithContent(contentState);
  const replySufix = 'RE: ';
  const forwardSufix = 'FW: ';
  const sufix =
    replyType === composerEvents.FORWARD ? forwardSufix : replySufix;
  const textSubject = sufix + removeActionsFromSubject(emailData.subject);

  const toEmails =
    replyType === composerEvents.REPLY || replyType === composerEvents.REPLY_ALL
      ? contacts.from.map(contact => formRecipientObject(contact))
      : [];

  const myEmailAddress = `${myAccount.recipientId}@${appDomain}`;
  const previousCcEmails = contacts.cc.map(contact =>
    formRecipientObject(contact)
  );
  const othersToEmails = contacts.to
    .map(contact => formRecipientObject(contact))
    .filter(contact => contact.email !== myEmailAddress);
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
    threadId
  };
};

const formSignature = () => {
  const signature = myAccount.signatureEnabled
    ? `<br/><br/><p>${myAccount.signature}</p>`
    : '<p></p>';
  return signature;
};

export const formComposerDataWithSignature = () => {
  const content = formSignature();
  const blocksFromHtml = htmlToDraft(content);
  const { contentBlocks, entityMap } = blocksFromHtml;
  const contentState = ContentState.createFromBlockArray(
    contentBlocks,
    entityMap
  );
  const htmlBody = EditorState.createWithContent(contentState);

  return {
    htmlBody
  };
};

export const formNewEmailFromData = data => {
  return {
    toEmails: [formRecipientObject(data.recipients.to)],
    textSubject: data.email.subject
  };
};

export const parseEmailAddress = emailAddressObject => {
  const email = emailAddressObject.email || emailAddressObject;
  const isEmailAddressFromAppDomain = email.indexOf(`@${appDomain}`) > 0;
  const parsedEmail = isEmailAddressFromAppDomain ? email.toLowerCase() : email;
  return { name: emailAddressObject.name, email: parsedEmail };
};

export const formExternalAttachmentTemplate = (
  encodedParams,
  mimeTypeSource,
  filename,
  formattedSize
) => {
  return `
    <div style="margin-top: 6px; float: left;">
      <a style="cursor: pointer; text-decoration: none;" href="https://services.criptext.com/downloader/${encodedParams}?e=1">
        <div style="align-items: center; border: 1px solid #e7e5e5; border-radius: 6px; display: flex; height: 20px; margin-right: 20px; padding: 10px; position: relative; width: 236px;">
          <div style="position: relative;">
            <div style="align-items: center; border-radius: 4px; display: flex; height: 22px; width: 22px;">
              <img src="https://cdn.criptext.com/External-Email/imgs/${mimeTypeSource}.png" style="height: 100%; width: 100%;"/>
            </div>
          </div>
          <div style="padding-top: 1px; display: flex; flex-grow: 1; height: 100%; margin-left: 10px; width: calc(100% - 32px);">
            <span style="color: black; padding-top: 1px; width: 160px; flex-grow: 1; font-size: 14px; font-weight: 700; overflow: hidden; padding-right: 5px; text-overflow: ellipsis; white-space: nowrap;">
              ${filename}
            </span>
            <span style="color: #9b9b9b; flex-grow: 0; font-size: 13px; white-space: nowrap; line-height: 21px;">
              ${formattedSize}
            </span>
          </div>
        </div>
    </a>
  </div>  
  `;
};
