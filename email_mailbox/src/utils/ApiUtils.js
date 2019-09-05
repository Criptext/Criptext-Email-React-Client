/* global process */
import { getOS } from './OSUtils';
import { getOsAndArch } from './ipc';
import { myAccount, getAlicePort } from './electronInterface';
import { version as appVersion } from './../../package.json';

const API_CLIENT_VERSION = '8.0.0';
const apiBaseUrl =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_DEV_API_URL
    : 'https://api.criptext.com';
const aliceUrl = 'http://localhost';
const debbyUrl = 'http://localhost:9085';

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
  const requestUrl = `${aliceUrl}:${getAlicePort()}/decrypt`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
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

export const generateMorePreKeys = async ({ accountId, newPreKeys }) => {
  const requestUrl = `${aliceUrl}:${getAlicePort()}/prekey`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      newPreKeys,
      accountId
    })
  };
  return await fetch(requestUrl, options);
};

export const getThreads = async ({
  accountId = 1,
  limit = 22, 
  date = Date.now().toString(),
  labelId = 1
}) => {
  const requestUrl = `${debbyUrl}/threadsById`;
  const options = {
    method: 'POST',
    body: JSON.stringify({
      accountId,
      limit, 
      date,
      labelId
    })
  };
  return await fetch(requestUrl, options);
};
