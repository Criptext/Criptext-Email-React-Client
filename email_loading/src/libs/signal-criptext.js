/*global libsignal SignalProtocolStore util*/

const KeyHelper = libsignal.KeyHelper;

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

export { createStore, generatePreKeyBundle };
