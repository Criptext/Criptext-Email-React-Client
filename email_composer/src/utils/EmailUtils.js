import { myAccount, LabelType } from './electronInterface';
import {
  getContactsByEmailId,
  getFilesByEmailId,
  getEmailByKeyWithbody,
  getAlias
} from './ipc';
import { cleanHTML, removeActionsFromSubject } from './StringUtils';
import { getFormattedDate } from './DateUtils';
import {
  appDomain,
  composerEvents,
  defaultEmptyMimetypeValue,
  externalDomains,
  previewLength
} from './const';
import { FILE_MODES } from './FileUtils';
import { Status } from '../components/Control';
import { emailRegex, HTMLTagsRegex } from './RegexUtils';
import string from './../lang';

const formAppSign = () => {
  return `<br/><i style="font-size: 12px;">${
    string.criptextSignature.sent_with
  } <span style="color: #0091ff; text-decoration: none;">Criptext</span> ${
    string.criptextSignature.secure_email
  }</i>`;
};

const getRecipientsWithDomain = (recipients, type) => {
  return recipients.map(email => {
    const recipientDomain = email.split('@');
    const username = recipientDomain[0];
    const domain = recipientDomain[1];

    return {
      username,
      domain,
      recipientId: domain === appDomain ? username : email,
      type
    };
  });
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
  const emailData = await getEmailByKeyWithbody({
    key: emailKeyToEdit,
    accountId: myAccount.id
  });
  const contacts = await getContactsByEmailId(emailData.id);
  const htmlBody = emailData.content;
  const textSubject = emailData.subject;
  const threadId = emailData.threadId;
  const toEmails = contacts.to.map(contact => formRecipientObject(contact));
  const ccEmails = contacts.cc.map(contact => formRecipientObject(contact));
  const bccEmails = contacts.bcc.map(contact => formRecipientObject(contact));
  const prevFiles = await getFilesByEmailId(emailData.id);
  const files = prevFiles.map(file => {
    return {
      fileData: {
        ...file,
        type: file.mimeType || defaultEmptyMimetypeValue
      },
      mode: FILE_MODES.UPLOADED,
      percentage: 100,
      token: file.token,
      shouldDuplicate: false,
      key: file.key,
      iv: file.iv
    };
  });
  return {
    toEmails,
    ccEmails,
    bccEmails,
    htmlBody,
    textSubject,
    threadId,
    files
  };
};

export const formOutgoingEmailFromData = ({
  alias,
  bccEmails,
  body,
  ccEmails,
  isEnterprise,
  labelId,
  secure,
  status,
  textSubject,
  toEmails,
  threadId,
  files
}) => {
  const to = getEmailAddressesFromEmailObject(toEmails);
  const cc = getEmailAddressesFromEmailObject(ccEmails);
  const bcc = getEmailAddressesFromEmailObject(bccEmails);

  const recipientDomains = [
    ...getRecipientsWithDomain(to, 'to'),
    ...getRecipientsWithDomain(cc, 'cc'),
    ...getRecipientsWithDomain(bcc, 'bcc')
  ];

  const myEmailAddress = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${appDomain}`;
  const email = {
    key: parseInt(Date.now()).toString(),
    subject: textSubject,
    preview: cleanHTML(body).slice(0, previewLength),
    date: Date.now(),
    status,
    unread: false,
    secure,
    threadId,
    content: '',
    fromAddress: `${myAccount.name} <${alias || myEmailAddress}>`
  };
  const recipients = {
    to,
    cc,
    bcc,
    from: [`${alias || myEmailAddress}`]
  };
  const labels = [labelId];
  const isToMe = recipientDomains.find(
    item => item.recipientId === myAccount.recipientId
  );
  if (isToMe) {
    labels.push(LabelType.inbox.id);
  }

  const emailData = {
    accountId: myAccount.id,
    accountEmail: myEmailAddress,
    email,
    recipients,
    labels,
    body,
    files
  };

  const bodyWithSign =
    secure || isEnterprise || !myAccount.signFooter
      ? body
      : `${body}${formAppSign()}`;

  return {
    bodyWithSign,
    emailData,
    recipientDomains
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
  const name = contact.name;
  const email = contact.email || contact;
  const emailTag = `<${email}>`;
  const complete = `${name || ''} ${emailTag}`;
  const enterpriseDomain = myAccount.recipientId.split('@')[1];
  const form = emailRegex.test(email)
    ? email.includes(`@${appDomain}`) || email.includes(`@${enterpriseDomain}`)
      ? 'tag-app-domain'
      : 'tag-default'
    : 'tag-error';
  return { name, email, complete: complete.trim(), form };
};

const formReplyForwardContent = (replyType, subject, date, from, to, body) => {
  let content = '';
  if (replyType === composerEvents.FORWARD) {
    content = `<div class="criptext_quote">${formForwardHeader(
      subject,
      date,
      from,
      to
    )}${body}</div>`;
  } else {
    content = `<div class="criptext_quote">${formReplyHeader(
      date,
      from
    )}<blockquote style="margin:10px 0 0 10px;padding-left: 10px;border-left:1px #0091ff solid;">${body}</blockquote></div>`;
  }

  return `${insertEmptyLine(2)}${content}${formSignature()}`;
};

export const formDataToReply = async (emailKeyToEdit, replyType) => {
  const emailIsForward = replyType === composerEvents.FORWARD;
  const emailData = await getEmailByKeyWithbody({
    key: emailKeyToEdit,
    accountId: myAccount.id
  });
  let files = [];
  if (emailIsForward) {
    const prevFiles = await getFilesByEmailId(emailData.id);
    files = prevFiles.map(file => {
      return {
        fileData: {
          ...file,
          type: file.mimeType || defaultEmptyMimetypeValue
        },
        mode: FILE_MODES.UPLOADED,
        percentage: 100,
        token: file.token,
        shouldDuplicate: true,
        key: file.key,
        iv: file.iv
      };
    });
  }

  const threadId = emailData.threadId;
  const contacts = await getContactsByEmailId(emailData.id);
  const aliases = await getAlias({ accountId: myAccount.id });

  const emailFrom = parseContactRow(emailData.fromAddress);
  const from = emailData.replyTo
    ? parseContactRow(emailData.replyTo)
    : emailFrom.name
      ? emailFrom
      : contacts.from[0];
  const content = formReplyForwardContent(
    replyType,
    emailData.subject,
    emailData.date,
    emailFrom,
    contacts.to,
    emailData.content
  );
  const myEmailAddress = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${appDomain}`;
  const htmlBody = content;
  const replySufix = 'RE: ';
  const forwardSufix = 'FW: ';
  const sufix = emailIsForward ? forwardSufix : replySufix;
  const textSubject = sufix + removeActionsFromSubject(emailData.subject);
  const toEmails = formToEmails(
    from,
    contacts.to,
    replyType,
    myEmailAddress,
    aliases
  );
  const previousCcEmails = filterRecipientObject(
    contacts.cc,
    myEmailAddress
  ).filter(contact => {
    return !aliases.find(
      alias => `${alias.name}@${alias.domain || appDomain}` === contact.email
    );
  });
  const ccEmails =
    replyType === composerEvents.REPLY_ALL ? previousCcEmails : [];

  const bccEmails = [];

  const fromEmail = from.email ? from.email : from;
  const isFromMe = fromEmail === myEmailAddress;

  const aliasRecipient =
    !isFromMe &&
    aliases.find(alias => {
      const aliasEmail = `${alias.name}@${alias.domain || appDomain}`;
      const aliasInToContacts = contacts.to.find(
        recipient => recipient.email === aliasEmail
      );
      if (replyType === composerEvents.FORWARD && aliasEmail === fromEmail)
        return true;
      if (aliasInToContacts) return true;
      const aliasInCcContacts = contacts.cc.find(
        recipient => recipient.email === aliasEmail
      );
      if (aliasInCcContacts) return true;
      return false;
    });
  const fromAddress = aliasRecipient
    ? `${aliasRecipient.name}@${aliasRecipient.domain || appDomain}`
    : myEmailAddress;
  return {
    fromAddress,
    toEmails,
    ccEmails,
    bccEmails,
    htmlBody,
    textSubject,
    threadId,
    files,
    status: emailIsForward ? Status.DISABLED : Status.ENABLED
  };
};

const formToEmails = (from, to, replyType, myEmailAddress, aliases) => {
  const fromEmail = from.email ? from.email : from;
  let isFromMe = fromEmail === myEmailAddress;
  if (!isFromMe)
    isFromMe = !!aliases.find(
      alias => `${alias.name}@${alias.domain || appDomain}` === fromEmail
    );

  if (
    replyType === composerEvents.REPLY ||
    replyType === composerEvents.REPLY_ALL
  ) {
    if (isFromMe) {
      return to.map(contact => formRecipientObject(contact));
    }
    const othersToEmails = filterRecipientObject(to, myEmailAddress).filter(
      contact => {
        return !aliases.find(
          alias =>
            `${alias.name}@${alias.domain || appDomain}` === contact.email
        );
      }
    );
    const fromContacts = [formRecipientObject(from)];
    return replyType === composerEvents.REPLY_ALL
      ? fromContacts.concat(othersToEmails)
      : fromContacts;
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
  const htmlBody = formSignature();
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

export const parseEmailAddress = emailAddress => {
  let name = emailAddress.name;
  let email = emailAddress.email || emailAddress.trim();
  let isEmailTag = false;
  if (typeof emailAddress === 'string') {
    const matched = emailAddress.match(HTMLTagsRegex);
    if (matched) {
      if (matched[0] === email) {
        isEmailTag = true;
        email = email.replace(/<|>/g, '').trim();
      } else if (matched.length === 1) {
        email = matched[0].replace(/<|>/g, '').trim();
        name = emailAddress.replace(matched[0], '').trim();
      }
    }
  }
  email = email.toLowerCase();
  const emailTag = isEmailTag ? email : `<${email}>`;
  const complete = `${name || ''} ${emailTag}`;
  const domain = email.split('@')[1];
  const enterpriseDomain = myAccount.recipientId.split('@')[1];
  const form = emailRegex.test(email)
    ? email.includes(`@${appDomain}`) || email.includes(`@${enterpriseDomain}`)
      ? 'tag-app-domain'
      : 'tag-default'
    : 'tag-error';
  const state =
    form === 'tag-default'
      ? externalDomains.includes(domain)
        ? undefined
        : 'tag-loading'
      : undefined;
  const contact = { name, email, complete: complete.trim(), state, form };
  return { contact, domain };
};

export const parseContactRow = contact => {
  const emailMatched = contact.match(HTMLTagsRegex);
  if (emailMatched) {
    const emailTag = emailMatched.pop();
    const email = emailTag.replace(/[<>]/g, '').toLowerCase();
    const name = contact.slice(0, contact.lastIndexOf('<')).trim();
    return { email, name };
  }
  return { email: contact.toLowerCase(), name: null };
};
