const dbManager = require('./DBManager');

class Account {
  async initialize() {
    const accountObj = (await dbManager.getAccount())[0] || {};
    this.recipientId = accountObj.recipientId;
    this.name = accountObj.name;
    this.jwt = accountObj.jwt;
    this.privKey = accountObj.privKey;
    this.pubKey = accountObj.pubKey;
    this.registrationId = accountObj.registrationId;
  }

  async create(params) {
    await dbManager.createAccount(params);
    await this.initialize();
  }

  getToken() {
    return this.jwt;
  }

  getIdentityKeyPair() {
    return {
      privKey: this.privKey,
      pubKey: this.pubKey
    };
  }

  getRegistrationId() {
    return this.registrationId;
  }

  getRecipientId() {
    return this.recipientId;
  }

  getName() {
    return this.name;
  }
}

module.exports = new Account();
