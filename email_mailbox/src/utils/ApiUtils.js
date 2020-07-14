/* global process */
import { getOS } from './OSUtils';
import { getOsAndArch } from './ipc';
import { myAccount, getAlicePort, getAlicePassword } from './electronInterface';
import { version as appVersion } from './../../package.json';
import {
  generateKeyAndIv,
  AesDecrypt,
  base64ToWordArray,
  resultString
} from './AESUtils';

const API_CLIENT_VERSION = '11.0.0';
const apiBaseUrl =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_DEV_API_URL
    : 'https://api.criptext.com';
const aliceUrl = 'http://localhost';
// Default
let osInfo = getOS();

const getDetails = async () => {
  const {
    distribution,
    distVersion,
    arch,
    installerType
  } = await getOsAndArch();
  osInfo =
    installerType +
    `${distribution ? distribution : ''}` +
    `${distVersion ? distVersion : ''}` +
    arch;
};
getDetails();

const formDefaultRequestHeaders = optionalToken => {
  const token = optionalToken || myAccount.jwt;
  return {
    os: osInfo,
    'app-version': appVersion,
    'criptext-api-version': API_CLIENT_VERSION,
    Authorization: `Bearer ${token}`
  };
};

export const apiCriptextRequest = async ({
  endpoint,
  method,
  params,
  querystring,
  optionalToken
}) => {
  const defaultHeaders = formDefaultRequestHeaders(optionalToken);
  switch (method) {
    case 'GET': {
      const requestUrl = `${apiBaseUrl}${endpoint}${querystring || ''}`;
      const options = {
        method,
        headers: defaultHeaders
      };
      try {
        return await fetch(requestUrl, options);
      } catch (error) {
        return { status: 500 };
      }
    }
    case 'POST': {
      const requestUrl = apiBaseUrl + endpoint;
      const options = {
        method,
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      };
      return await fetch(requestUrl, options);
    }
    default:
      break;
  }
};

export const fetchDecryptBody = async ({
  emailKey,
  senderId,
  deviceId,
  recipientId,
  messageType,
  body,
  headers,
  headersMessageType,
  fileKeys
}) => {
  const { salt, iv, key } = generateKeyAndIv(getAlicePassword());
  const requestUrl = `${aliceUrl}:${getAlicePort()}/decrypt`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      salt,
      iv,
      emailKey,
      senderId,
      deviceId,
      recipientId,
      messageType,
      body,
      headers,
      headersMessageType,
      fileKeys
    })
  };
  const response = await fetch(requestUrl, options);
  if (!response || response.status !== 200) {
    return response;
  }

  const text = await response.text();
  const result = await AesDecrypt(
    text,
    base64ToWordArray(key),
    base64ToWordArray(iv)
  );
  return {
    ...JSON.parse(resultString(result)),
    status: 200
  };
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

export const generateKeyBundle = async ({
  recipientId,
  deviceId,
  accountId
}) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/keybundle`;
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

export const generateMorePreKeys = async ({ recipientId, newPreKeys }) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/prekey`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      newPreKeys,
      recipientId
    })
  };
  return await fetch(requestUrl, options);
};
