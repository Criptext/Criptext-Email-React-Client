/*global libsignal util*/
import { getEmailBody } from './../utils/electronInterface';
import SignalProtocolStore from './store';
const store = new SignalProtocolStore();
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
  const { status, text } = await getEmailBody(bodyKey);
  if (status !== 200) {
    return;
  }
  if (!deviceId && !messageType) {
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
  return util.toString(binaryText);
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

export default {
  decryptEmail
};
