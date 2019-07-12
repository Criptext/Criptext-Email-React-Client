export const createAccountCredentials = async ({
  recipientId,
  deviceId,
  name
}) => {
  const requestUrl = "http://localhost:8085/account";
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
  const requestUrl = "http://localhost:8085/keybundle";
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