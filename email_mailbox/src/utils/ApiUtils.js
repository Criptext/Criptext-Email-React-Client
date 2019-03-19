/* global process */
import { getOS } from './OSUtils';
import { getOsAndArch } from './ipc';
import { myAccount } from './electronInterface';
import { version as appVersion } from './../../package.json';

const token = myAccount.jwt;
const API_CLIENT_VERSION = '6.0.0';
const apiBaseUrl =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_DEV_API_URL
    : 'https://api.criptext.com';

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

const formDefaultRequestHeaders = () => {
  return {
    os: osInfo,
    'app-version': appVersion,
    'criptext-api-version': API_CLIENT_VERSION,
    Authorization: 'Bearer ' + token
  };
};

export const apiCriptextRequest = async ({
  endpoint,
  method,
  params,
  querystring
}) => {
  const defaultHeaders = formDefaultRequestHeaders(method);
  switch (method) {
    case 'GET': {
      const requestUrl = `${apiBaseUrl}${endpoint}${querystring || ''}`;
      const options = {
        method,
        headers: defaultHeaders
      };
      return await fetch(requestUrl, options);
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
