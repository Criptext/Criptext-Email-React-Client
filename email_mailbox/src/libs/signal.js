/*global libsignal util*/
import { getEmailBody } from './../utils/electronInterface';
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
  const binaryText = await sessionCipher.decryptPreKeyWhisperMessage(
    textEncrypted,
    'binary'
  );
  return util.toString(binaryText);
};

export default {
  decryptEmail
};
