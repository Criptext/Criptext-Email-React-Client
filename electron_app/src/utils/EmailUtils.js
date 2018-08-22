const { removeAppDomain, removeHTMLTags } = require('./StringUtils');
const { appDomain } = require('./const');
const myAccount = require('./../Account');

const formRecipients = recipientString => {
  return !recipientString ? [] : recipientString.split(',');
};

const getEmailAddressesFromEmailObject = emails => {
  return emails.map(item => item.email || item);
};

const filterNonCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) < 0);
};

const getRecipientsFromData = ({ to, cc, bcc, from }) => {
  return {
    to: formRecipients(to),
    cc: formRecipients(cc),
    bcc: formRecipients(bcc),
    from: formRecipients(from)
  };
};

const getCriptextRecipients = (recipients, type) => {
  return recipients
    .filter(email => email.indexOf(`@${appDomain}`) > 0)
    .map(email => ({
      recipientId: removeAppDomain(email),
      type
    }));
};

/* To export
   ----------------------------- */
const EmailStatus = {
  FAIL: 1,
  UNSENT: 2,
  NONE: 3,
  SENDING: 4,
  SENT: 5,
  DELIVERED: 6,
  READ: 7
};

const checkEmailIsTo = ({ to, cc, bcc, from, type }) => {
  const recipients = getRecipientsFromData({ to, cc, bcc, from });
  const recipientsArray =
    type === 'to'
      ? [...recipients.to, ...recipients.cc, ...recipients.bcc]
      : [...recipients.from];

  const [isTo] = recipientsArray.filter(
    email => email.indexOf(`${myAccount.recipientId}@${appDomain}`) > -1
  );
  return isTo ? true : false;
};

const filterCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) > 0);
};

const formIncomingEmailFromData = ({
  bcc,
  body,
  cc,
  date,
  from,
  isToMe,
  metadataKey,
  subject,
  to,
  threadId,
  unread
}) => {
  const content = body || '';
  const preview = body
    ? removeHTMLTags(content)
        .slice(0, 21)
        .trim()
    : '';
  const status = isToMe ? EmailStatus.NONE : EmailStatus.DELIVERED;
  const recipients = getRecipientsFromData({ to, cc, bcc, from });
  const email = {
    key: metadataKey,
    threadId: threadId,
    s3Key: metadataKey,
    content,
    preview,
    subject,
    date,
    status,
    unread,
    secure: true,
    isMuted: false
  };

  return { email, recipients };
};

const formOutgoingEmailFromData = ({
  bccEmails,
  body,
  ccEmails,
  files,
  iv,
  key,
  labelId,
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
    content: body,
    preview: removeHTMLTags(body).slice(0, 21),
    date: Date.now(),
    status: EmailStatus.SENDING,
    unread: false,
    secure: true,
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

  const fileKeyParams = files.length ? { key, iv } : null;

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
    body
  };
};

const getRecipientIdFromEmailAddressTag = emailAddressTag => {
  const emailAddressMatched = emailAddressTag.match(/<(.*)>/);
  const emailAddress = emailAddressMatched
    ? emailAddressMatched[1]
    : emailAddressTag;
  return removeAppDomain(emailAddress);
};

module.exports = {
  checkEmailIsTo,
  filterCriptextRecipients,
  formIncomingEmailFromData,
  formOutgoingEmailFromData,
  getRecipientIdFromEmailAddressTag
};
