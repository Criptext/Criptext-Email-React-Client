/*global libsignal util*/
import {
  getSessionRecordIds,
  insertPreKeys,
  restartAlice
} from './../utils/ipc';
import SignalProtocolStore from './store';
import { fetchEmailBody } from '../utils/FetchUtils';
import {
  fetchDecryptKey,
  fetchDecryptBody,
  generateMorePreKeys
} from '../utils/ApiUtils';
import { myAccount } from '../utils/electronInterface';

const store = new SignalProtocolStore();
const PREKEY_INITIAL_QUANTITY = 100;
const ALICE_ERROR = 'alice unavailable';
const CONTENT_NOT_AVAILABLE = 'CONTENT_NOT_AVAILABLE';
const CONTENT_UNENCRYPTED = 'Content Unencrypted';
const DUPLICATE_MESSAGE = 'Duplicate Message';
const ciphertextType = {
  CIPHERTEXT: 1,
  PREKEY_BUNDLE: 3
};

const decryptEmail = async ({
  bodyKey,
  recipientId,
  deviceId,
  messageType,
  fileKeys,
  optionalToken,
  accountRecipientId
}) => {
  const { status, body } = await fetchEmailBody({ bodyKey, optionalToken });
  if (status !== 200) return;
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return { decryptedBody: body.body };
  }
  const res = await aliceRequestWrapper(() => {
    return fetchDecryptBody({
      emailKey: bodyKey,
      senderId: recipientId,
      deviceId,
      recipientId: accountRecipientId || myAccount.recipientId,
      messageType,
      body: body.body,
      headers: body.headers,
      headersMessageType: messageType,
      fileKeys: fileKeys
    });
  });
  if (!res) {
    throw new Error(ALICE_ERROR);
  } else if (res.status === 500) {
    throw new Error(CONTENT_UNENCRYPTED);
  } else if (res.status === 409) {
    throw new Error(DUPLICATE_MESSAGE);
  } else if (res.status !== 200) {
    throw new Error(ALICE_ERROR);
  }

  const {
    decryptedBody = null,
    decryptedHeaders = null,
    decryptedFileKeys = null
  } = await res;
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
  const res = await aliceRequestWrapper(() => {
    return fetchDecryptKey({
      recipientId,
      deviceId,
      messageType,
      key: text
    });
  });
  const decryptedText = await res.arrayBuffer();
  return decryptedText;
};

const generateAndInsertMorePreKeys = async (
  accountId,
  accountRecipientId,
  optionalToken
) => {
  const currentPreKeyIds = await getSessionRecordIds({ accountId });
  if (currentPreKeyIds.length === PREKEY_INITIAL_QUANTITY) return;

  const preKeyIds = Array.apply(null, { length: PREKEY_INITIAL_QUANTITY }).map(
    (item, index) => index + 1
  );
  const newPreKeyIds = preKeyIds.filter(id => !currentPreKeyIds.includes(id));
  try {
    const res = await aliceRequestWrapper(() => {
      return generateMorePreKeys({
        accountId: accountId || myAccount.recipientId,
        newPreKeys: newPreKeyIds
      });
    });
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.error(res.status);
      return;
    }
    const resObj = await res.json();
    await insertPreKeys({
      preKeys: resObj.preKeys,
      recipientId: accountRecipientId,
      optionalToken
    });
  } catch (newPreKeysError) {
    // eslint-disable-next-line no-console
    console.error(newPreKeysError);
  }
};

const aliceRequestWrapper = async func => {
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

export default {
  ALICE_ERROR,
  CONTENT_NOT_AVAILABLE,
  DUPLICATE_MESSAGE,
  decryptEmail,
  decryptFileKey,
  decryptKey,
  generateAndInsertMorePreKeys
};
