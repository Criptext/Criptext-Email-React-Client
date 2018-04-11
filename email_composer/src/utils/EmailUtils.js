import { convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { removeAppDomain, removeHTMLTags } from './StringUtils';
import { appDomain } from './const';
import { myAccount } from './electronInterface';

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
      deviceId: 1,
      type
    }));
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
    delivered: false,
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
