/*global libsignal util*/
import {
  getSessionRecordIds,
  insertPreKeys,
  restartAlice
} from './../utils/ipc';
import SignalProtocolStore from './store';
import { fetchEmailBody } from '../utils/FetchUtils';
import { fetchDecryptBody, generateMorePreKeys } from '../utils/ApiUtils';
import { myAccount } from '../utils/electronInterface';

const store = new SignalProtocolStore();
const PREKEY_INITIAL_QUANTITY = 100;
const ciphertextType = {
  CIPHERTEXT: 1,
  PREKEY_BUNDLE: 3
};

const decryptEmail = async ({
  bodyKey,
  recipientId,
  deviceId,
  messageType,
  fileKeys
}) => {
  const { status, body } = await fetchEmailBody({ bodyKey });
  if (status !== 200) {
    return;
  }
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return { decryptedBody: body.body };
  }
  let retries = 3;
  let res;
  while (retries >= 0) {
    retries -= 1;
    try {
      res = await fetchDecryptBody({
        emailKey: bodyKey,
        senderId: recipientId,
        deviceId,
        recipientId: myAccount.recipientId,
        messageType,
        body: body.body,
        headers: body.headers,
        headersMessageType: messageType,
        fileKeys: fileKeys
      });
      if (res.status === 200) break;
    } catch (ex) {
      if (ex.toString() !== 'TypeError: Failed to fetch') break;
      await restartAlice();
    }
  }
  if (!res) {
    throw new Error('alice unavailable' + typeof thing);
  } else if (res.status === 500) {
    return {
      decryptedBody: 'Content Unencrypted'
    };
  } else if (res.status !== 200) {
    throw new Error('alice unavailable' + typeof thing);
  }

  const {
    decryptedBody = null,
    decryptedHeaders = null,
    decryptedFileKeys = null
  } = await res.json();
  return {
    decryptedBody,
    decryptedHeaders,
    decryptedFileKeys
  };
};

const decryptMessage = async (sessionCipher, textEncrypted, messageType) => {
  switch (messageType) {
    case ciphertextType.CIPHERTEXT:
      return await sessionCipher.decryptWhisperMessage(textEncrypted, 'binary');
    case ciphertextType.PREKEY_BUNDLE:
      return await sessionCipher.decryptPreKeyWhisperMessage(
        textEncrypted,
        'binary'
      );
    default:
      break;
  }
};

const decryptFileKey = async ({
  fileKey,
  messageType,
  recipientId,
  deviceId
}) => {
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return fileKey;
  }
  const fileKeyEncrypted = util.toArrayBufferFromBase64(fileKey);
  const addressFrom = new libsignal.SignalProtocolAddress(
    recipientId,
    deviceId
  );
  const sessionCipher = new libsignal.SessionCipher(store, addressFrom);
  const binaryText = await decryptMessage(
    sessionCipher,
    fileKeyEncrypted,
    messageType
  );
  return util.toString(binaryText);
};

const decryptKey = async ({ text, recipientId, deviceId, messageType = 3 }) => {
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return text;
  }
  const textEncrypted = util.toArrayBufferFromBase64(text);
  const addressFrom = new libsignal.SignalProtocolAddress(
    recipientId,
    deviceId
  );
  const sessionCipher = new libsignal.SessionCipher(store, addressFrom);
  const binaryText = await decryptMessage(
    sessionCipher,
    textEncrypted,
    messageType
  );
  return binaryText;
};

const generateAndInsertMorePreKeys = async () => {
  const currentPreKeyIds = await getSessionRecordIds();
  if (currentPreKeyIds.length === PREKEY_INITIAL_QUANTITY) return;

  const preKeyIds = Array.apply(null, { length: PREKEY_INITIAL_QUANTITY }).map(
    (item, index) => index + 1
  );
  const newPreKeyIds = preKeyIds.filter(id => !currentPreKeyIds.includes(id));
  try {
    const res = await generateMorePreKeys({
      accountId: myAccount.recipientId,
      newPreKeys: newPreKeyIds
    });
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.error(res.status);
      return;
    }
    const resObj = await res.json();
    await insertPreKeys(resObj.preKeys);
  } catch (newPreKeysError) {
    // eslint-disable-next-line no-console
    console.error(newPreKeysError);
  }
};

export default {
  decryptEmail,
  decryptFileKey,
  decryptKey,
  generateAndInsertMorePreKeys
};
