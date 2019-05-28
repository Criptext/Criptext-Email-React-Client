/*global util*/

import { myAccount } from './../utils/electronInterface';
import {
  createIdentityKeyRecord,
  createPreKeyRecord,
  createSessionRecord,
  createSignedPreKeyRecord,
  deletePreKeyPair,
  deleteSessionRecord,
  getIdentityKeyRecord,
  getAccountByParams,
  getPreKeyPair,
  getSessionRecord,
  getSignedPreKey,
  updateIdentityKeyRecord
} from './../utils/ipc';
import { splitSignalIdentifier } from './../utils/StringUtils';

export default class ScopedSignalProtocolStore {
  constructor(accountId) {
    this.store = {};
    this.accountId = accountId;
  }

  Direction = {
    SENDING: 1,
    RECEIVING: 2
  };

  getIdentityKeyPair = async () => {
    let result = this.get('identityKey');
    if (!result) {
      const [account] = await getAccountByParams({ id: this.accountId });
      const res = {
        privKey: account.privKey,
        pubKey: account.pubKey
      };
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

    const [identityKeyRecord] = await getIdentityKeyRecord({
      accountId: this.accountId,
      identityKey: util.toString(identityKey)
    });
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

    const { recipientId } = splitSignalIdentifier(identifier);
    const [identityKeyRecord] = await getIdentityKeyRecord({
      accountId: this.accountId,
      recipientId
    });
    return Promise.resolve(util.toArrayBuffer(identityKeyRecord.identityKey));
  };

  saveIdentity = async (identifier, identityKey) => {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to put identity key for undefined/null key');

    const { recipientId, deviceId } = splitSignalIdentifier(identifier);
    const [oldIdentityKeyRecord] = await getIdentityKeyRecord({
      accountId: this.accountId,
      recipientId,
      deviceId
    });
    if (!oldIdentityKeyRecord) {
      await createIdentityKeyRecord({
        accountId: this.accountId,
        recipientId,
        deviceId,
        identityKey: util.toString(identityKey)
      });
      return false;
    } else if (
      util.toString(identityKey) !== oldIdentityKeyRecord.identityKey
    ) {
      await updateIdentityKeyRecord({
        accountId: this.accountId,
        recipientId,
        deviceId,
        identityKey: util.toString(identityKey)
      });
      return true;
    }
    return false;
  };

  loadPreKey = async keyId => {
    let res = this.get('25519KeypreKey' + keyId);
    if (!res) {
      const [resp] = await getPreKeyPair({
        accountId: this.accountId,
        preKeyId: keyId
      });
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
    const params = {
      preKeyId: keyId,
      preKeyPrivKey: util.toBase64(keyPair.privKey),
      preKeyPubKey: util.toBase64(keyPair.pubKey),
      accountId: this.accountId
    };
    return Promise.resolve(createPreKeyRecord(params));
  };

  removePreKey = async keyId => {
    await deletePreKeyPair({ preKeyId: keyId, accountId: this.accountId });
    return Promise.resolve(this.remove('25519KeypreKey' + keyId));
  };

  loadSignedPreKey = async keyId => {
    let res = this.get('25519KeysignedKey' + keyId);
    if (!res) {
      const [resp] = await getSignedPreKey({
        accountId: this.accountId,
        signedPreKeyId: keyId
      });
      if (resp) {
        res = {
          privKey: util.toArrayBufferFromBase64(resp.signedPreKeyPrivKey),
          pubKey: util.toArrayBufferFromBase64(resp.signedPreKeyPubKey)
        };
        this.put('25519KeysignedKey' + keyId, res);
      } else {
        res = undefined;
      }
    }
    return res;
  };

  storeSignedPreKey = (keyId, keyPair) => {
    const params = {
      accountId: this.accountId,
      signedPreKeyId: keyId,
      signedPreKeyPrivKey: util.toBase64(keyPair.privKey),
      signedPreKeyPubKey: util.toBase64(keyPair.pubKey)
    };
    return Promise.resolve(createSignedPreKeyRecord(params));
  };

  removeSignedPreKey = keyId => {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
  };

  loadSession = async identifier => {
    let recordText = this.get('session' + identifier);
    if (!recordText) {
      const { recipientId, deviceId } = splitSignalIdentifier(identifier);
      const [session] = await getSessionRecord({
        accountId: this.accountId,
        recipientId,
        deviceId
      });
      if (session) {
        recordText = session.record;
        this.put('session' + identifier, recordText);
      }
    }
    return recordText ? JSON.parse(recordText) : undefined;
  };

  storeSession = async (identifier, record) => {
    const { recipientId, deviceId } = splitSignalIdentifier(identifier);
    const recordText = util.jsonThing(record);
    await createSessionRecord({
      accountId: this.accountId,
      recipientId,
      deviceId,
      record: recordText
    });
    return Promise.resolve(this.put('session' + identifier, recordText));
  };

  removeSession = async identifier => {
    const { recipientId, deviceId } = splitSignalIdentifier(identifier);
    await deleteSessionRecord({
      recipientId,
      deviceId,
      accountId: this.accountId
    });
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
