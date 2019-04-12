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
    this.isActive = accountObj.isActive;
    this.isLoggedIn = accountObj.isLoggedIn;
  }

  update(accountObj) {
    this.id = accountObj.id || this.id;
    this.jwt = accountObj.jwt || this.jwt;
    this.name = accountObj.name || this.name;
    this.signature = accountObj.signature || this.signature;
    this.signatureEnabled =
      accountObj.signatureEnabled !== undefined
        ? accountObj.signatureEnabled
        : this.signatureEnabled;
    this.isActive =
      accountObj.isActive !== undefined ? accountObj.isActive : this.isActive;
    this.isLoggedIn =
      accountObj.isLoggedIn !== undefined
        ? accountObj.isLoggedIn
        : this.isLoggedIn;
  }

  getIdentityKeyPair() {
    return {
      privKey: this.privKey,
      pubKey: this.pubKey
    };
  }
}

module.exports = new Account();
