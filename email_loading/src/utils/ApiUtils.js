const aliceUrl = "http://localhost:8085"

export const createAccountCredentials = async ({
  recipientId,
  deviceId,
  name
}) => {
  const requestUrl = `${aliceUrl}/account`;
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

export const generateKeyBundle = async ({
  recipientId,
  deviceId,
  accountId
}) => {
  const requestUrl = `${aliceUrl}/keybundle`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      recipientId, 
      deviceId, 
      accountId
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
  const requestUrl = `${aliceUrl}/decrypt/key`;
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