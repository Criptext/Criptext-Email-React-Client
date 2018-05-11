/*global libsignal util*/
import { getEmailBody, getSessionRecord } from './../utils/electronInterface';
import SignalProtocolStore from './store';

const store = new SignalProtocolStore();

const decryptEmail = async (bodyKey, recipientId, deviceId) => {
  const res = await getEmailBody(bodyKey);
  if (res.status !== 200) {
    return;
  }
  const textEncrypted = util.toArrayBufferFromBase64(res.text);
  const addressFrom = new libsignal.SignalProtocolAddress(
    recipientId,
    deviceId
  );
  const sessionCipher = new libsignal.SessionCipher(store, addressFrom);
  const [existsSessionRecord] = await getSessionRecord({
    recipientId,
    deviceId
  });
  const binaryText = await decryptMessage(
    sessionCipher,
    textEncrypted,
    existsSessionRecord
  );
  return util.toString(binaryText);
};

const decryptMessage = async (sessionCipher, textEncrypted, existsSession) => {
  if (existsSession) {
    return await sessionCipher.decryptWhisperMessage(textEncrypted, 'binary');
  }
  return await sessionCipher.decryptPreKeyWhisperMessage(
    textEncrypted,
    'binary'
  );
};

export default {
  decryptEmail
};
