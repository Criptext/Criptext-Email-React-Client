/* global process */
import { myAccount } from './electronInterface';
import { version as appVersion } from './../../package.json';

let token;
const API_CLIENT_VERSION = '6.0.0';
const apiBaseUrl =
  process.env.REACT_APP_ENV === 'development'
    ? process.env.REACT_APP_DEV_API_URL
    : 'https://api.criptext.com';

const formDefaultRequestHeaders = () => {
  token = myAccount.jwt;
  return {
    os: 'Linux',
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
