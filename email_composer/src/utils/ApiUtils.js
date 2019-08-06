const aliceUrl = 'http://localhost:8085';

export const createSession = async ({ accountRecipientId, keybundles }) => {
  const requestUrl = `${aliceUrl}/session/create`;
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
  const requestUrl = `${aliceUrl}/encrypt/email`;
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
