import { removeAppDomain, removeHTMLTags } from './StringUtils';
import signal from './../libs/signal';

const getContentMessage = async (bodyKey, recipientId, deviceId) => {
  const content = await signal.decryptEmail(bodyKey, recipientId, deviceId);
  if (content === undefined) {
    return { content: '', preview: '' };
  }
  const preview = removeHTMLTags(content).slice(0, 21);
  return { content, preview };
};

const getRecipientIdFromEmailAddress = emailAddress => {
  return removeAppDomain(emailAddress);
};

const formRecipients = recipientString => {
  return recipientString === '' ? [] : recipientString.split(',');
};

export const buildNewEmailFromData = async (data, deviceId) => {
  const bodyKey = data.bodyKey;
  const recipientId = getRecipientIdFromEmailAddress(data.from);
  const { content, preview } = await getContentMessage(
    bodyKey,
    recipientId,
    deviceId
  );
  const email = {
    key: data.metadataKey,
    threadId: data.threadId,
    s3Key: bodyKey,
    content,
    preview,
    subject: data.subject,
    date: data.date,
    delivered: false,
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
