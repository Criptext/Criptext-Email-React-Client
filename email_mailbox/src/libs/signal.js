/*global libsignal util*/
import { getEmailBody } from './../utils/electronInterface';
import SignalProtocolStore from './store';

const store = new SignalProtocolStore();

const decryptEmail = async ({bodyKey, recipientId, deviceId, messageType}) => {
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
  const binaryText = await decryptMessage(
    sessionCipher,
    textEncrypted,
    messageType
  );
  return util.toString(binaryText);
};

const decryptMessage = async (sessionCipher, textEncrypted, messageType) => {
  switch (messageType) {
    case 1:
    console.log('decryptPreKeyWhisperMessage');
    return await sessionCipher.decryptWhisperMessage(
      textEncrypted,
      'binary'
    );
    case 3:
    console.log('decryptWhisperMessage');
    return await sessionCipher.decryptPreKeyWhisperMessage(
      textEncrypted,
      'binary'
    );
    default:
      break;
  }
};

export default {
  decryptEmail
};
