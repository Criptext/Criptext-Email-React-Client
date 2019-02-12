import { EmailStatus } from './const';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import sanitizeHtml from 'sanitize-html';
import { version } from './../../package.json';
import { LabelType, myAccount } from './electronInterface';
import { HTMLTagsRegex, emailRegex } from './RegexUtils';
import { Utf8Decode } from './EncodingUtils';
import { removeAppDomain, toCapitalize } from './StringUtils';
import { appDomain } from './const';
import string from './../lang';
import { getOsAndArch } from './ipc';

const cleanEmails = emails => {
  return emails.map(email => {
    const emailTag = email.match(HTMLTagsRegex);
    if (emailTag) {
      if (emailTag[0].length === email.length) {
        return email.replace(/<|>/g, '');
      }
    }
    return email;
  });
};

const cleanHTML = string => {
  const stringHTMLcontentRemoved = string
    .replace(/<style[^>]*>[^>]*<\/style>/g, '')
    .replace(/<script[^>]*>[^>]*<\/script>/g, '')
    .replace(/&[a-z]{2,5};/g, ' ');
  return removeHTMLTags(stringHTMLcontentRemoved);
};

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

const getRecipientsFromData = ({ to, cc, bcc, from }) => {
  return {
    to: Array.isArray(to) ? cleanEmails(to) : formRecipients(to),
    cc: Array.isArray(cc) ? cleanEmails(cc) : formRecipients(cc),
    bcc: Array.isArray(bcc) ? cleanEmails(bcc) : formRecipients(bcc),
    from: formRecipients(from)
  };
};

const removeHTMLTags = string => {
  const stringHTMLTagRemoved = string.replace(HTMLTagsRegex, ' ');
  return stringHTMLTagRemoved.replace(/\s\s+/g, ' ').trim();
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
    },
    allowedSchemes: ['cid', 'http', 'https', 'data'],
    allowedSchemesAppliedToAttributes: ['src']
  });
};

export const addCollapseDiv = (htmlString, key, isCollapse) => {
  const regexTag = /<blockquote|criptext_quote|gmail_quote/;
  const matches = htmlString.match(regexTag);
  if (matches) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const blockquote =
      doc.getElementsByClassName('criptext_quote')[0] ||
      doc.getElementsByTagName('blockquote')[0] ||
      doc.getElementsByClassName('gmail_quote')[0];
    const i = document.createElement('i');
    i.className = 'icon-dots';
    const div = document.createElement('div');
    div.className = 'div-collapse';
    div.appendChild(i);
    div.setAttribute('id', `div-collapse-${key}`);
    blockquote.parentElement.insertBefore(div, blockquote);
    blockquote.style.display = isCollapse ? 'none' : 'block';
    blockquote.setAttribute('id', `blockquote-${key}`);
    return doc.documentElement.innerHTML;
  }
  return htmlString;
};

export const compareEmailDate = (emailA, emailB) =>
  emailA.date < emailB.date ? -1 : emailA.date > emailB.date ? 1 : 0;

export const checkEmailIsTo = ({ to, cc, bcc, from, type }) => {
  const recipients = getRecipientsFromData({
    to,
    cc,
    bcc,
    from
  });
  const recipientsArray =
    type === 'to'
      ? [...recipients.to, ...recipients.cc, ...recipients.bcc]
      : [...recipients.from];
  const [isTo] = recipientsArray.filter(
    email =>
      email.toLowerCase().indexOf(`${myAccount.recipientId}@${appDomain}`) > -1
  );
  return isTo ? true : false;
};

export const defineRejectedLabels = labelId => {
  switch (labelId) {
    case LabelType.allmail.id:
      return [LabelType.spam.id, LabelType.trash.id, LabelType.draft.id];
    case LabelType.spam.id:
      return [LabelType.trash.id];
    case LabelType.trash.id:
      return [LabelType.spam.id];
    default:
      return [LabelType.spam.id, LabelType.trash.id];
  }
};

export const filterCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) > 0);
};

export const formContactSupportEmailContent = async () => {
  const {
    os,
    distribution,
    distVersion,
    arch,
    installerType
  } = await getOsAndArch();
  const lines = '<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>';
  const header = `<strong>${string.emails.contact_support.content}</strong>`;
  const separator = '<br/>*****************************<br/>';
  const appInfo = `
    <strong> App Version: </strong> ${version}<br/>
    <strong> Installer type: </strong> ${installerType}<br/>
    ${os && `<strong> OS: </strong> ${toCapitalize(os)}<br/>`}
    ${distribution ? `<strong> Dist: </strong> ${distribution}<br/>` : ''}
    ${distVersion ? `<strong> OS Vers: </strong> ${distVersion}<br/>` : ''}
    ${arch && `<strong> Arch: </strong> ${arch}<br/>`}
  `;
  const content = lines + header + separator + appInfo;

  return {
    email: {
      subject: `${string.emails.contact_support.subject} - ${os} (${arch})`,
      content
    },
    recipients: {
      to: {
        name: string.emails.contact_support.recipient.name,
        email: `support@${appDomain}`
      }
    }
  };
};

export const formEmailLabel = ({ emailId, labels }) => {
  return labels.map(labelId => {
    return {
      labelId,
      emailId
    };
  });
};

export const formFilesFromData = ({ files, date, fileKeys, emailContent }) => {
  return files.map((file, index) => {
    const { token, name, read_only, size, status, mimeType, cid } = file;
    const key = fileKeys ? fileKeys[index].key : null;
    const iv = fileKeys ? fileKeys[index].iv : null;
    return {
      token,
      name,
      readOnly: read_only ? true : false,
      size,
      status: status || 1,
      date,
      mimeType,
      key,
      iv,
      cid: emailContent.includes(`cid:${cid}`) ? cid : null
    };
  });
};

export const cleanEmailBody = body => {
  return body ? Utf8Decode(sanitize(body)) : '';
};

export const formIncomingEmailFromData = ({
  bcc,
  body,
  cc,
  date,
  from,
  isFromMe,
  metadataKey,
  subject,
  to,
  threadId,
  unread,
  messageId,
  replyTo,
  boundary
}) => {
  const content = body || '';
  const preview = body
    ? cleanHTML(content)
        .slice(0, 100)
        .trim()
    : '';
  const status = isFromMe ? EmailStatus.DELIVERED : EmailStatus.NONE;
  const recipients = getRecipientsFromData({
    to,
    cc,
    bcc,
    from
  });
  const email = {
    key: metadataKey,
    threadId,
    s3Key: metadataKey,
    preview,
    subject,
    date,
    status,
    unread,
    secure: true,
    isMuted: false,
    messageId,
    replyTo,
    fromAddress: from,
    boundary,
    content: ''
  };
  return { email, recipients };
};

export const getRecipientIdFromEmailAddressTag = emailAddressTag => {
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
  return recipientId.toLowerCase();
};

export const parseSignatureHtmlToEdit = signatureHtml => {
  const blocksFromHtml = htmlToDraft(signatureHtml);
  const { contentBlocks, entityMap } = blocksFromHtml;
  const contentState = ContentState.createFromBlockArray(
    contentBlocks,
    entityMap
  );
  return EditorState.createWithContent(contentState);
};

export const parseSignatureContentToHtml = signatureContent => {
  return draftToHtml(convertToRaw(signatureContent.getCurrentContent()));
};

export const validateEmailStatusToSet = (prevEmailStatus, nextEmailStatus) => {
  const isAlreadyUnsent = prevEmailStatus === EmailStatus.UNSEND;
  const isAlreadyRead = prevEmailStatus === EmailStatus.READ;
  return isAlreadyUnsent ? null : isAlreadyRead ? null : nextEmailStatus;
};

export const filterTemporalThreadIds = threadIds => {
  const temporalThreadIdRegex = /<criptext-temp[^>]*>?/;
  return threadIds.filter(threadId => !temporalThreadIdRegex.test(threadId));
};

export const parseContactRow = contact => {
  const matches = contact.match(HTMLTagsRegex);
  if (matches) {
    const emailTag = matches.pop();
    const email = emailTag.replace(/[<>]/g, '').toLowerCase();
    const name = contact.slice(0, contact.lastIndexOf('<')).trim();
    return { email, name };
  }
  return { email: contact.toLowerCase(), name: null };
};
