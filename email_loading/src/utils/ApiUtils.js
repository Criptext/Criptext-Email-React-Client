import { getAlicePort } from './electronInterface';
const aliceUrl = 'http://localhost';

export const createAccountCredentials = async ({
  recipientId,
  deviceId,
  name
}) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/account`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      recipientId,
      deviceId,
      name
    })
  };
  return await fetch(requestUrl, options);
};

export const generateKeyBundle = async ({ recipientId, deviceId }) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/keybundle`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      recipientId,
      deviceId
    })
  };
  return await fetch(requestUrl, options);
};

export const fetchDecryptKey = async ({
  deviceId,
  recipientId,
  messageType,
  key
}) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/decrypt/key`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      deviceId,
      recipientId,
      messageType,
      key
    })
  };
  return await fetch(requestUrl, options);
};

export const createSession = async ({ accountRecipientId, keybundles }) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/session/create`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      accountRecipientId,
      keybundles
    })
  };
  return await fetch(requestUrl, options);
};

export const encryptKey = async ({ deviceId, recipientId, key }) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/encrypt/key`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      deviceId,
      recipientId,
      key
    })
  };
  return await fetch(requestUrl, options);
};
