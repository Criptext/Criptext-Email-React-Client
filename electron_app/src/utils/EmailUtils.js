const sanitizeHtml = require('sanitize-html');
const { removeAppDomain, removeHTMLTags } = require('./StringUtils');
const { appDomain } = require('./const');
const myAccount = require('./../Account');
const { HTMLTagsRegex, emailRegex } = require('./RegexUtils');

const formRecipients = recipientString => {
  const recipients = !recipientString ? [] : recipientString.split(',');
  return recipients
    .filter(
      recipient => !!recipient.match(/<(.*)>/) || !!recipient.match(emailRegex)
    )
    .map(recipient => {
      return recipient.replace(/"/g, '').trim();
    });
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

const sanitize = body => {
  return sanitizeHtml(body, {
    allowedTags: [
      'a',
      'b',
      'blockquote',
      'br',
      'caption',
      'cite',
      'code',
      'col',
      'colgroup',
      'dd',
      'div',
      'dl',
      'dt',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'i',
      'img',
      'li',
      'ol',
      'p',
      'pre',
      'q',
      'small',
      'span',
      'strike',
      'strong',
      'sub',
      'sup',
      'table',
      'tbody',
      'td',
      'tfoot',
      'th',
      'thead',
      'tr',
      'u',
      'ul',
      'style',
      'title',
      'head'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['alt', 'src'],
      '*': [
        'align',
        'bgcolor',
        'border',
        'cellspacing',
        'cellpadding',
        'class',
        'colspan',
        'height',
        'style',
        'tabindex',
        'valign',
        'width'
      ]
    }
  });
};

const cleantToPreview = body => {
  return removeHTMLTags(sanitizeHtml(body));
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
  const content = body ? sanitize(body) : '';
  const preview = body
    ? cleantToPreview(body)
        .slice(0, 100)
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
  secure,
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
    preview: cleantToPreview(body).slice(0, 100),
    date: Date.now(),
    status: EmailStatus.SENDING,
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
  const emailAddressTagMatches = emailAddressTag.match(HTMLTagsRegex);
  if (emailAddressTagMatches) {
    const lastPosition = emailAddressTagMatches.length - 1;
    const emailAddress = emailAddressTagMatches[lastPosition].replace(
      /[<>]/g,
      ''
    );
    return removeAppDomain(emailAddress);
  }
  const emailAddressMatches = emailAddressTag.match(emailRegex);
  return emailAddressMatches ? emailAddressMatches[0] : emailAddressTag;
};

module.exports = {
  checkEmailIsTo,
  filterCriptextRecipients,
  formIncomingEmailFromData,
  formOutgoingEmailFromData,
  getRecipientIdFromEmailAddressTag
};
