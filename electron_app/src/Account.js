const dbManager = require('./DBManager');

class Account {
  constructor() {
    this.initialize = async () => {
      const accountObj = (await dbManager.getAccount())[0] || {};
      this.recipientId = accountObj.recipientId;
      this.name = accountObj.name;
      this.jwt = accountObj.jwt;
      this.privKey = accountObj.privKey;
      this.pubKey = accountObj.pubKey;
      this.registrationId = accountObj.registrationId;
    };
  }

  async create(params) {
    await dbManager.createAccount(params);
    await this.initialize();
  }

  async getToken() {
    if (!this.jwt) {
      await this.initialize();
    }
    return this.jwt;
  }

  async getIdentityKeyPair() {
    if (!this.privKey || !this.pubKey) {
      await this.initialize();
    }
    return {
      privKey: this.privKey,
      pubKey: this.pubKey
    };
  }

  async getRegistrationId() {
    if (!this.registrationId) {
      await this.initialize();
    }
    return this.registrationId;
  }

  async getRecipientId() {
    if (!this.recipientId) {
      await this.initialize();
    }
    return this.recipientId;
  }

  async getName() {
    if (!this.name) {
      await this.initialize();
    }
    return this.name;
  }
}

module.exports = new Account();
