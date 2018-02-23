/*global libsignal SignalProtocolStore util*/

const KeyHelper = libsignal.KeyHelper;

const createAddress = (name, deviceId) => {
  return new libsignal.SignalProtocolAddress(name, deviceId);
};

const createStore = () => {
  var store = new SignalProtocolStore();
  return Promise.all([
    KeyHelper.generateIdentityKeyPair(),
    KeyHelper.generateRegistrationId()
  ]).then(function(result) {
    store.put('identityKey', result[0]);
    store.put('registrationId', result[1]);
    return store;
  });
};

const generatePreKeyBundle = (store, preKeyId, signedPreKeyId) => {
  return Promise.all([
    store.getIdentityKeyPair(),
    store.getLocalRegistrationId()
  ]).then(function(result) {
    var identity = result[0];
    var registrationId = result[1];

    return Promise.all([
      KeyHelper.generatePreKey(preKeyId),
      KeyHelper.generateSignedPreKey(identity, signedPreKeyId)
    ]).then(function(keys) {
      var preKey = keys[0];
      var signedPreKey = keys[1];

      store.storePreKey(preKeyId, preKey.keyPair);
      store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

      return {
        signedPreKeySignature: util.toBase64(signedPreKey.signature),
        signedPreKeyPublic: util.toBase64(signedPreKey.keyPair.pubKey),
        signedPreKeyId: signedPreKeyId,
        identityPublicKey: util.toBase64(identity.pubKey),
        registrationId: registrationId,
        preKeys: [
          { publicKey: util.toBase64(preKey.keyPair.pubKey), id: preKeyId }
        ]
      };
    });
  });
};

const createSession = (store, addressTo, keyBundleTo) => {
  var keys = {
    identityKey: util.toArrayBufferFromBase64(keyBundleTo.identityPublicKey),
    preKey: {
      keyId: keyBundleTo.preKey.id,
      publicKey: util.toArrayBufferFromBase64(keyBundleTo.preKey.publicKey)
    },
    registrationId: keyBundleTo.registrationId,
    signedPreKey: {
      keyId: keyBundleTo.signedPreKeyId,
      publicKey: util.toArrayBufferFromBase64(keyBundleTo.signedPreKeyPublic),
      signature: util.toArrayBufferFromBase64(keyBundleTo.signedPreKeySignature)
    }
  };

  var sessionBuilder = new libsignal.SessionBuilder(store, addressTo);
  return sessionBuilder.processPreKey(keys).then(function() {
    return sessionBuilder;
  });
};

const encryptMessage = (store, addressTo, sessionBuilderTo, textMessage) => {
  var sessionCipher = new libsignal.SessionCipher(store, addressTo);
  return store
    .loadSession(addressTo)
    .then(function() {
      return sessionCipher.encrypt(textMessage);
    })
    .then(function(ciphertext) {
      return util.toBase64(util.toArrayBuffer(ciphertext.body));
    });
};

export default {
  createAddress,
  createSession,
  createStore,
  encryptMessage,
  generatePreKeyBundle
};
