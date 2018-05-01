/*global util*/

import {
  myAccount,
  createIdentityKeyRecord,
  createKeys,
  createSessionRecord,
  deletePreKeyPair,
  deleteSessionRecord,
  getIdentityKeyRecord,
  getPreKeyPair,
  getSessionRecord,
  getSignedPreKey,
  updateIdentityKeyRecord
} from './../utils/electronInterface';

export default class SignalProtocolStore {
  constructor() {
    this.store = {};
  }

  Direction = {
    SENDING: 1,
    RECEIVING: 2
  };

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
    return Promise.resolve(result);
  };

  getLocalRegistrationId = () => {
    let result = this.get('registrationId');
    if (!result) {
      result = myAccount.registrationId;
      this.store['registrationId'] = result;
    }
    return Promise.resolve(result);
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

  isTrustedIdentity = async (identifier, identityKey) => {
    if (identifier === null || identifier === undefined) {
      throw new Error('tried to check identity key for undefined/null key');
    }
    if (!(identityKey instanceof ArrayBuffer)) {
      throw new Error('Expected identityKey to be an ArrayBuffer');
    }

    const identifierArray = identifier.split('.');
    const recipientId = identifierArray[0];
    const [identityKeyRecord] = await getIdentityKeyRecord({ recipientId });
    if (identityKeyRecord === undefined) {
      return Promise.resolve(true);
    }
    return Promise.resolve(
      util.equalArrayBuffers(
        util.toArrayBuffer(identityKeyRecord.identityKey),
        identityKey
      )
    );
  };

  loadIdentityKey = async identifier => {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to get identity key for undefined/null key');

    const identifierArray = identifier.split('.');
    const recipientId = identifierArray[0];
    const [identityKeyRecord] = await getIdentityKeyRecord({ recipientId });
    return Promise.resolve(util.toArrayBuffer(identityKeyRecord.identityKey));
  };

  saveIdentity = async (identifier, identityKey) => {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to put identity key for undefined/null key');

    const identifierArray = identifier.split('.');
    const recipientId = identifierArray[0];
    const [oldIdentityKeyRecord] = await getIdentityKeyRecord({ recipientId });
    if (!oldIdentityKeyRecord) {
      await createIdentityKeyRecord({
        recipientId,
        identityKey: util.toString(identityKey)
      });
      return Promise.resolve(false);
    } else if (
      util.toString(identityKey) !== oldIdentityKeyRecord.identityKey
    ) {
      await updateIdentityKeyRecord({
        recipientId,
        identityKey: util.toString(identityKey)
      });
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
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
    if (!res) {
      const [resp] = await getPreKeyPair({ preKeyId: keyId });
      if (resp) {
        res = {
          privKey: util.toArrayBufferFromBase64(resp.preKeyPrivKey),
          pubKey: util.toArrayBufferFromBase64(resp.preKeyPubKey)
        };
        this.put('25519KeypreKey' + keyId, res);
      } else {
        res = undefined;
      }
    }
    return res;
  };

  storePreKey = (keyId, keyPair) => {
    return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair));
  };

  removePreKey = async keyId => {
    await deletePreKeyPair({ preKeyId: keyId });
    return Promise.resolve(this.remove('25519KeypreKey' + keyId));
  };

  loadSignedPreKey = async keyId => {
    let res = this.get('25519KeysignedKey' + keyId);
    if (!res) {
      const [resp] = await getSignedPreKey({ signedPreKeyId: keyId });
      if (resp) {
        res = {
          privKey: util.toArrayBufferFromBase64(resp.signedPrivKey),
          pubKey: util.toArrayBufferFromBase64(resp.signedPubKey)
        };
        this.put('25519KeysignedKey' + keyId, res);
      } else {
        res = undefined;
      }
    }
    return res;
  };

  storeSignedPreKey = (keyId, keyPair) => {
    return Promise.resolve(this.put('25519KeysignedKey' + keyId, keyPair));
  };

  removeSignedPreKey = keyId => {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
  };

  loadSession = async identifier => {
    let recordText = this.get('session' + identifier);
    if (!recordText) {
      const identifierArray = identifier.split('.');
      const recipientId = identifierArray[0];
      const deviceId = Number(identifierArray[1]);
      const [session] = await getSessionRecord({ recipientId, deviceId });
      if (session) {
        recordText = session.record;
        this.put('session' + identifier, recordText);
      }
    }
    return recordText ? JSON.parse(recordText) : undefined;
  };

  storeSession = async (identifier, record) => {
    const identifierArray = identifier.split('.');
    const recipientId = identifierArray[0];
    const deviceId = Number(identifierArray[1]);
    const recordText = util.jsonThing(record);
    await createSessionRecord({ recipientId, deviceId, record: recordText });
    return Promise.resolve(this.put('session' + identifier, recordText));
  };

  removeSession = async identifier => {
    const identifierArray = identifier.split('.');
    const recipientId = identifierArray[0];
    const deviceId = Number(identifierArray[1]);
    await deleteSessionRecord({ recipientId, deviceId });
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
