import { getAlicePort } from './electronInterface';
const aliceUrl = 'http://localhost';

export const createSession = async ({ accountRecipientId, keybundles }) => {
  const requestUrl = `${aliceUrl}:${(getAlicePort())}/session/create`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      accountRecipientId,
      keybundles
    })
  };
  return await fetch(requestUrl, options);
};

export const encryptEmail = async ({
  accountRecipientId,
  deviceId,
  recipientId,
  body,
  preview,
  fileKeys
}) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/encrypt/email`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      accountRecipientId,
      deviceId,
      recipientId,
      body,
      preview,
      fileKeys
    })
  };
  return await fetch(requestUrl, options);
};
