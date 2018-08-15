import { removeAppDomain, removeHTMLTags } from './StringUtils';
import signal from './../libs/signal';
import { EmailStatus, appDomain } from './const';
import { myAccount } from './electronInterface';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';

const getContentMessage = async ({
  bodyKey,
  recipientId,
  deviceId,
  messageType
}) => {
  const content = await signal.decryptEmail({
    bodyKey,
    recipientId,
    deviceId,
    messageType
  });
  if (content === undefined) {
    return { content: '', preview: '' };
  }
  const preview = removeHTMLTags(content)
    .slice(0, 21)
    .trim();
  return { content, preview };
};

export const decryptFileKeyEmail = async ({
  fileKey,
  messageType,
  recipientId,
  deviceId
}) => {
  const decrypted = await signal.decryptFileKey({
    fileKey,
    messageType,
    recipientId,
    deviceId
  });
  const [key, iv] = decrypted.split(':');
  return { key, iv };
};

const getRecipientIdFromEmailAddressTag = emailAddressTag => {
  const emailAddressMatched = emailAddressTag.match(/<(.*)>/);
  const emailAddress = emailAddressMatched
    ? emailAddressMatched[1]
    : emailAddressTag;
  return removeAppDomain(emailAddress);
};

const formRecipients = recipientString => {
  return recipientString === '' ? [] : recipientString.split(',');
};

export const checkEmailIsTo = (data, to) => {
  const recipients = getRecipientsFromData(data);
  const recipientsArray =
    to === 'to'
      ? [...recipients.to, ...recipients.cc, ...recipients.bcc]
      : [...recipients.from];

  const [isTo] = recipientsArray.filter(
    email => email.indexOf(`${myAccount.recipientId}@${appDomain}`) > -1
  );
  return isTo;
};

export const formIncomingEmailFromData = async data => {
  const { metadataKey, senderDeviceId, messageType, fileKey } = data;
  const recipientId = getRecipientIdFromEmailAddressTag(data.from);
  let fileKeyParams;
  if (fileKey) {
    fileKeyParams = await decryptFileKeyEmail({
      fileKey,
      messageType,
      recipientId,
      deviceId: senderDeviceId
    });
  }

  const { content, preview } = await getContentMessage({
    bodyKey: metadataKey,
    recipientId,
    deviceId: senderDeviceId,
    messageType
  });

  const isToMe = checkEmailIsTo(data, 'to');
  const unread = isToMe ? true : false;
  const status = isToMe ? EmailStatus.NONE : EmailStatus.DELIVERED;
  const email = {
    key: data.metadataKey,
    threadId: data.threadId,
    s3Key: metadataKey,
    content,
    preview,
    subject: data.subject,
    date: data.date,
    status,
    unread,
    secure: true,
    isMuted: false
  };
  return { email, fileKeyParams };
};

export const getRecipientsFromData = data => {
  return {
    to: formRecipients(data.to),
    cc: formRecipients(data.cc),
    bcc: formRecipients(data.bcc),
    from: formRecipients(data.from)
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

export const getCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) > 0);
};

export const validateEmailStatusToSet = (prevEmailStatus, nextEmailStatus) => {
  const isAlreadyUnsent = prevEmailStatus === EmailStatus.UNSEND;
  const isAlreadyOpened = prevEmailStatus === EmailStatus.OPENED;
  return isAlreadyUnsent ? null : isAlreadyOpened ? null : nextEmailStatus;
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
