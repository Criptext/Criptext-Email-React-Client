const sanitizeHtml = require('sanitize-html');
const { cleanHTML, removeAppDomain } = require('./StringUtils');
const { Utf8Decode } = require('./EncodingUtils');
const { appDomain } = require('./const');
const myAccount = require('./../Account');
const { HTMLTagsRegex, emailRegex } = require('./RegexUtils');

const formRecipients = recipientString => {
  const recipients = !recipientString ? [] : recipientString.split(',');
  return recipients
    .filter(
      recipient =>
        !!recipient.match(HTMLTagsRegex) || !!recipient.match(emailRegex)
    )
    .map(recipient => {
      return recipient.replace(/"/g, '').trim();
    });
};

const formAppSign = () => {
  return '<br/><span style="font-size: 12px;">Sent with <a style="color: #0091ff; text-decoration: none;" href="https://www.criptext.com/dl">Criptext</a> secure email</span>';
};

const getEmailAddressesFromEmailObject = emails => {
  return emails.map(item => item.email || item);
};

const filterNonCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) < 0);
};

const getRecipientsFromData = ({
  to,
  toArray,
  cc,
  ccArray,
  bcc,
  bccArray,
  from
}) => {
  return {
    to: toArray || formRecipients(to),
    cc: ccArray || formRecipients(cc),
    bcc: bccArray || formRecipients(bcc),
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

const checkEmailIsTo = ({
  to,
  toArray,
  cc,
  ccArray,
  bcc,
  bccArray,
  from,
  type
}) => {
  const recipients = getRecipientsFromData({
    to,
    toArray,
    cc,
    ccArray,
    bcc,
    bccArray,
    from
  });
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

const formIncomingEmailFromData = (
  {
    bcc,
    bccArray,
    body,
    cc,
    ccArray,
    date,
    from,
    isToMe,
    metadataKey,
    subject,
    to,
    toArray,
    threadId,
    unread
  },
  isExternal
) => {
  const content = isExternal
    ? body
      ? Utf8Decode(sanitize(body))
      : ''
    : Utf8Decode(body);
  const preview = body
    ? cleanHTML(content)
        .slice(0, 100)
        .trim()
    : '';
  const status = isToMe ? EmailStatus.NONE : EmailStatus.DELIVERED;
  const recipients = getRecipientsFromData({
    to,
    toArray,
    cc,
    ccArray,
    bcc,
    bccArray,
    from
  });
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
    body: email.content
  };
};

const getRecipientIdFromEmailAddressTag = emailAddressTag => {
  const emailAddressTagMatches = emailAddressTag.match(HTMLTagsRegex);
  let recipientId;
  if (emailAddressTagMatches) {
    const lastPosition = emailAddressTagMatches.length - 1;
    const emailAddress = emailAddressTagMatches[lastPosition].replace(
      /[<>]/g,
      ''
    );
    recipientId = removeAppDomain(emailAddress);
  } else {
    const emailAddressMatches = emailAddressTag.match(emailRegex);
    recipientId = emailAddressMatches
      ? emailAddressMatches[0]
      : emailAddressTag;
  }
  const isExternal = !!recipientId.match(emailRegex);
  return { recipientId, isExternal };
};

module.exports = {
  checkEmailIsTo,
  filterCriptextRecipients,
  formIncomingEmailFromData,
  formOutgoingEmailFromData,
  getRecipientIdFromEmailAddressTag
};
