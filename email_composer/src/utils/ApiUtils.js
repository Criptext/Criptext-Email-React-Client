import { getAlicePort, getAlicePassword } from './electronInterface';
import { generateKeyAndIv, base64ToWordArray, AesEncrypt } from './AESUtils';

const aliceUrl = 'http://localhost';

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

export const encryptEmail = async ({
  accountRecipientId,
  deviceId,
  recipientId,
  body,
  preview,
  fileKeys
}) => {
  const { salt, iv, key } = generateKeyAndIv(getAlicePassword());
  const plainContent = JSON.stringify({
    accountRecipientId,
    deviceId,
    recipientId,
    body,
    preview,
    fileKeys
  });
  const content = await AesEncrypt(
    plainContent,
    base64ToWordArray(key),
    base64ToWordArray(iv)
  );
  const requestUrl = `${aliceUrl}:${getAlicePort()}/encrypt/email`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      salt,
      iv,
      content
    })
  };
  return await fetch(requestUrl, options);
};
