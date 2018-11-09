import { EmailStatus } from './const';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import sanitizeHtml from 'sanitize-html';
import { LabelType, myAccount } from './electronInterface';
import { HTMLTagsRegex, emailRegex } from './RegexUtils';
import { Utf8Decode } from './EncodingUtils';
import { removeAppDomain } from './StringUtils';
import { appDomain } from './const';

const cleanEmails = emails => {
  return emails.map(email => email.replace(/<|>/g, ''));
};

const cleanHTML = string => {
  const stringHTMLcontentRemoved = string
    .replace(/<style[^>]*>[^>]*<\/style>/g, '')
    .replace(/<script[^>]*>[^>]*<\/script>/g, '')
    .replace(/&nbsp;/, ' ');
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
    }
  });
};

export const addCollapseDiv = (htmlString, key) => {
  const regexTag = /<blockquote|criptext_quote/;
  const matches = htmlString.match(regexTag);
  if (matches) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const blockquote =
      doc.getElementsByClassName('criptext_quote')[0] ||
      doc.getElementsByTagName('blockquote')[0];
    const i = document.createElement('i');
    i.className = 'icon-dots';
    const div = document.createElement('div');
    div.className = 'div-collapse';
    div.appendChild(i);
    div.setAttribute('id', `div-collapse-${key}`);
    blockquote.parentElement.insertBefore(div, blockquote);
    blockquote.style.display = 'none';
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
    email => email.indexOf(`${myAccount.recipientId}@${appDomain}`) > -1
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

export const formEmailLabel = ({ emailId, labels }) => {
  return labels.map(labelId => {
    return {
      labelId,
      emailId
    };
  });
};

export const formFilesFromData = ({ files, date }) => {
  return files.map(file => {
    const { token, name, read_only, size, status, mimeType } = file;
    return {
      token,
      name,
      readOnly: read_only ? true : false,
      size,
      status: status || 0,
      date,
      mimeType
    };
  });
};

export const formIncomingEmailFromData = (
  {
    bcc,
    body,
    cc,
    date,
    from,
    isEmailApp,
    isFromMe,
    metadataKey,
    subject,
    to,
    threadId,
    unread,
    messageId
  },
  isExternal
) => {
  const content = isExternal
    ? body
      ? isEmailApp
        ? Utf8Decode(sanitize(body))
        : Utf8Decode(body)
      : ''
    : Utf8Decode(body);
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
    content,
    preview,
    subject,
    date,
    status,
    unread,
    secure: true,
    isMuted: false,
    messageId
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
  const isExternal = !!recipientId.match(emailRegex);
  return { recipientId, isExternal };
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
  const isAlreadyOpened = prevEmailStatus === EmailStatus.OPENED;
  return isAlreadyUnsent ? null : isAlreadyOpened ? null : nextEmailStatus;
};

export const filterTemporalThreadIds = threadIds => {
  const temporalThreadIdRegex = /<criptext-temp[^>]*>?/;
  return threadIds.filter(threadId => !temporalThreadIdRegex.test(threadId));
};
