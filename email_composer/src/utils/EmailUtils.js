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

export const EmailStatus = {
  FAIL: 1,
  UNSENT: 2,
  NONE: 3,
  SENDING: 4,
  SENT: 5,
  DELIVERED: 6,
  READ: 7
};

export const formOutgoingEmailFromData = (composerData, labelId) => {
  const recipients = {
    to: composerData.toEmails,
    cc: composerData.ccEmails,
    bcc: composerData.bccEmails
  };
  const to = formRecipients(recipients);

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
    isMuted: false
  };
  const from = myAccount.recipientId;
  recipients.from = [`${from}@${appDomain}`];
  const data = {
    email,
    recipients,
    labels: [labelId]
  };

  return {
    data,
    to,
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

  const toEmails = contacts.to.map(contact => contact.email);
  const ccEmails = contacts.cc.map(contact => contact.email);
  const bccEmails = contacts.bcc.map(contact => contact.email);

  return {
    toEmails,
    ccEmails,
    bccEmails,
    htmlBody,
    textSubject
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
      ? contacts.from.map(contact => contact.email)
      : [];

  const myEmailAddress = `${myAccount.recipientId}@${appDomain}`;
  const previousCcEmails = contacts.cc.map(contact => contact.email);
  const othersToEmails = contacts.to
    .map(contact => contact.email)
    .filter(email => email !== myEmailAddress);
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
