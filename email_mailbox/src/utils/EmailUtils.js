import { removeAppDomain, removeHTMLTags } from './StringUtils';
import signal from './../libs/signal';

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
  const preview = removeHTMLTags(content).slice(0, 21);
  return { content, preview };
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

export const formIncomingEmailFromData = async data => {
  const { messageId, senderDeviceId, messageType } = data;
  const recipientId = getRecipientIdFromEmailAddressTag(data.from);
  const { content, preview } = await getContentMessage({
    bodyKey: messageId,
    recipientId,
    deviceId: senderDeviceId,
    messageType
  });
  const email = {
    key: data.metadataKey,
    threadId: data.threadId,
    s3Key: messageId,
    content,
    preview,
    subject: data.subject,
    date: data.date,
    status: 1,
    unread: true,
    secure: true,
    isMuted: false
  };
  return email;
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
