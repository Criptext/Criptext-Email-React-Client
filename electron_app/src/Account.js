class Account {
  initialize(accountObj) {
    this.id = accountObj.id;
    this.recipientId = accountObj.recipientId;
    this.name = accountObj.name;
    this.jwt = accountObj.jwt;
    this.privKey = accountObj.privKey;
    this.pubKey = accountObj.pubKey;
    this.registrationId = accountObj.registrationId;
    this.deviceId = accountObj.deviceId;
    this.signature = accountObj.signature;
    this.signatureEnabled = accountObj.signatureEnabled;
    this.other = {};
  }

  update(accountObj) {
    this.id = accountObj.id || this.id;
    this.recipientId = accountObj.recipientId || this.recipientId;
    this.name = accountObj.name || this.name;
    this.jwt = accountObj.jwt || this.jwt;
    this.privKey = accountObj.privKey || this.privKey;
    this.pubKey = accountObj.pubKey || this.pubKey;
    this.registrationId = accountObj.registrationId || this.registrationId;
    this.deviceId = accountObj.deviceId || this.deviceId;
    this.signature = accountObj.signature || this.signature;
    this.signatureEnabled =
      accountObj.signatureEnabled !== undefined
        ? accountObj.signatureEnabled
        : this.signatureEnabled;
    this.other = accountObj.other || this.other;
  }

  getIdentityKeyPair() {
    return {
      privKey: this.privKey,
      pubKey: this.pubKey
    };
  }
}

module.exports = new Account();
