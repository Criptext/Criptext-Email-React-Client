import { getAlicePort } from './electronInterface';
import { restartAlice } from './ipc';

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

export const aliceRequestWrapper = async func => {
  let retries = 3;
  let res;
  while (retries >= 0) {
    retries -= 1;
    try {
      res = await func();
      if (res.status === 200) break;
    } catch (ex) {
      if (ex.toString() !== 'TypeError: Failed to fetch') break;
      await restartAlice();
    }
  }
  return res;
};
