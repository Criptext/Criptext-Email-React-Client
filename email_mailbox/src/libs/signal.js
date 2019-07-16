/*global libsignal util*/
import { getSessionRecordIds, insertPreKeys } from './../utils/ipc';
import SignalProtocolStore from './store';
import { fetchEmailBody } from '../utils/FetchUtils';
import { fetchDecryptBody } from '../utils/ApiUtils';
import { myAccount } from '../utils/electronInterface'

const KeyHelper = libsignal.KeyHelper;
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
  messageType
}) => {
  const { status, body } = await fetchEmailBody({ bodyKey });
  if (status !== 200) {
    return;
  }
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return { decryptedBody: body.body };
  }
  const res = await fetchDecryptBody({
    senderId: recipientId,
    deviceId,
    recipientId: myAccount.recipientId,
    messageType,
    body: body.body
  })
  console.log(res);
  if (res.status !== 200) {
    return {
      decryptedBody: 'Content Unencrypted'
    }
  }
  const decryptedBody = await res.text();
  console.log(decryptedBody);
  return {
    decryptedBody,
    decryptedHeaders: null
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
  const preKeysToServer = [];
  const preKeysToStore = [];
  for (const preKeyId of newPreKeyIds) {
    const preKey = await KeyHelper.generatePreKey(preKeyId);
    preKeysToServer.push({
      publicKey: util.toBase64(preKey.keyPair.pubKey),
      id: preKeyId
    });
    preKeysToStore.push(preKey.keyPair);
  }
  try {
    const { status } = await insertPreKeys(preKeysToServer);
    if (status === 200) {
      return await Promise.all(
        preKeysToStore.map(async (preKeyPair, index) => {
          await store.storePreKey(newPreKeyIds[index], preKeyPair);
        })
      );
    }
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
