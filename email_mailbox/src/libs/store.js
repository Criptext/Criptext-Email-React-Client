/*global util*/

import {
  myAccount,
  createKeys,
  getPreKeyPair,
  getSignedPreKey
} from './../utils/electronInterface';

export default class SignalProtocolStore {
  constructor() {
    this.store = {};
  }

  getIdentityKeyPair = () => {
    let result = this.get('identityKey');
    if (!result) {
      const res = myAccount.getIdentityKeyPair();
      result = {
        privKey: util.toArrayBufferFromBase64(res.privKey),
        pubKey: util.toArrayBufferFromBase64(res.pubKey)
      };
      this.put('identityKey', result);
    }
    return result;
  };

  getLocalRegistrationId = () => {
    let result = this.get('registrationId');
    if (!result) {
      result = myAccount.registrationId;
      this.store['registrationId'] = result;
    }
    return result;
  };

  put = (key, value) => {
    if (
      key === undefined ||
      value === undefined ||
      key === null ||
      value === null
    )
      throw new Error('Tried to store undefined/null');
    this.store[key] = value;
  };

  get = (key, defaultValue) => {
    if (key === null || key === undefined)
      throw new Error('Tried to get value for undefined/null key');
    if (key in this.store) {
      return this.store[key];
    }
    return defaultValue;
  };

  remove = key => {
    if (key === null || key === undefined)
      throw new Error('Tried to remove value for undefined/null key');
    delete this.store[key];
  };

  isTrustedIdentity = (identifier, identityKey) => {
    if (identifier === null || identifier === undefined) {
      throw new Error('tried to check identity key for undefined/null key');
    }
    if (!(identityKey instanceof ArrayBuffer)) {
      throw new Error('Expected identityKey to be an ArrayBuffer');
    }
    const trusted = this.get('identityKey' + identifier);
    if (trusted === undefined) {
      return Promise.resolve(true);
    }
    return Promise.resolve(
      util.toString(identityKey) === util.toString(trusted)
    );
  };

  loadIdentityKey = identifier => {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to get identity key for undefined/null key');
    return Promise.resolve(this.get('identityKey' + identifier));
  };

  saveIdentity = (identifier, identityKey) => {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to put identity key for undefined/null key');
    return Promise.resolve(this.put('identityKey' + identifier, identityKey));
  };

  storeKeys = ({ preKeyId, preKeyPair, signedPreKeyId, signedPreKeyPair }) => {
    const params = {
      preKeyId,
      preKeyPrivKey: util.toBase64(preKeyPair.privKey),
      preKeyPubKey: util.toBase64(preKeyPair.pubKey),
      signedPreKeyId,
      signedPrivKey: util.toBase64(signedPreKeyPair.privKey),
      signedPubKey: util.toBase64(signedPreKeyPair.pubKey)
    };
    Promise.resolve(createKeys(params));
  };

  loadPreKey = async keyId => {
    let res = this.get('25519KeypreKey' + keyId);
    if (res) {
      res = { pubKey: res.pubKey, privKey: res.privKey };
    } else {
      const resp = await getPreKeyPair({ preKeyId: keyId });
      res = {
        privKey: util.toArrayBufferFromBase64(resp[0].preKeyPrivKey),
        pubKey: util.toArrayBufferFromBase64(resp[0].preKeyPubKey)
      };
      await this.storePreKey(keyId, res);
    }
    return res;
  };

  storePreKey = (keyId, keyPair) => {
    return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair));
  };

  removePreKey = keyId => {
    return Promise.resolve(this.remove('25519KeypreKey' + keyId));
  };

  loadSignedPreKey = async keyId => {
    let res = this.get('25519KeysignedKey' + keyId);
    if (res) {
      res = { pubKey: res.pubKey, privKey: res.privKey };
    } else {
      const resp = await getSignedPreKey({ signedPreKeyId: keyId });
      res = {
        privKey: util.toArrayBufferFromBase64(resp[0].signedPrivKey),
        pubKey: util.toArrayBufferFromBase64(resp[0].signedPubKey)
      };
      await this.storeSignedPreKey(keyId, res);
    }
    return res;
  };

  storeSignedPreKey = (keyId, keyPair) => {
    return Promise.resolve(this.put('25519KeysignedKey' + keyId, keyPair));
  };

  removeSignedPreKey = keyId => {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
  };

  loadSession = identifier => {
    return Promise.resolve(this.get('session' + identifier));
  };

  storeSession = (identifier, record) => {
    return Promise.resolve(this.put('session' + identifier, record));
  };

  removeSession = identifier => {
    return Promise.resolve(this.remove('session' + identifier));
  };

  removeAllSessions = identifier => {
    for (const id in this.store) {
      if (id.startsWith('session' + identifier)) {
        delete this.store[id];
      }
    }
    return Promise.resolve();
  };
}
