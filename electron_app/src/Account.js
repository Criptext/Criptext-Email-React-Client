class Account {
  initialize(accountObj) {
    this.recipientId = accountObj.recipientId;
    this.name = accountObj.name;
    this.jwt = accountObj.jwt;
    this.privKey = accountObj.privKey;
    this.pubKey = accountObj.pubKey;
    this.registrationId = accountObj.registrationId;
    this.deviceId = accountObj.deviceId;
    this.opened = accountObj.opened;
    this.signature = accountObj.signature;
    this.signatureEnabled = accountObj.signatureEnabled;
  }

  update(accountObj) {
    this.jwt = accountObj.jwt || this.jwt;
    this.name = accountObj.name || this.name;
    this.opened =
      accountObj.opened !== undefined ? accountObj.opened : this.opened;
    this.signature = accountObj.signature || this.signature;
    this.signatureEnabled =
      accountObj.signatureEnabled !== undefined
        ? accountObj.signatureEnabled
        : this.signatureEnabled;
  }

  getIdentityKeyPair() {
    return {
      privKey: this.privKey,
      pubKey: this.pubKey
    };
  }
}

module.exports = new Account();
