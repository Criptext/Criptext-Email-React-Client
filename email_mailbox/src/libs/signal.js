/*global libsignal util*/
import { getEmailBody } from './../utils/electronInterface';
import SignalProtocolStore from './store';
const store = new SignalProtocolStore();
const ciphertextType = {
  CIPHERTEXT: 1,
  PREKEY_BUNDLE: 3
};
const EXTERNAL_RECIPIENT_ID_SERVER = 'b';
const EXTERNAL_DEVICE_ID_SERVER = 1;

const decryptEmail = async ({
  bodyKey,
  recipientId,
  deviceId,
  messageType,
  external
}) => {
  const { status, text } = await getEmailBody(bodyKey);
  if (status !== 200) {
    return;
  }
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return text;
  }
  const textEncrypted = util.toArrayBufferFromBase64(text);
  const [recipientIdFrom, deviceIdFrom] =
    external === true
      ? [EXTERNAL_RECIPIENT_ID_SERVER, EXTERNAL_DEVICE_ID_SERVER]
      : [recipientId, deviceId];
  const addressFrom = new libsignal.SignalProtocolAddress(
    recipientIdFrom,
    deviceIdFrom
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

const decryptFileKey = async ({
  fileKey,
  messageType,
  recipientId,
  deviceId
}) => {
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

export default {
  decryptEmail,
  decryptFileKey
};
