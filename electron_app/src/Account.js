const { APP_DOMAIN } = require('./utils/const');

const accountProperties = [
  'jwt',
  'name',
  'signature',
  'signatureEnabled',
  'signFooter',
  'encryptToExternals',
  'autoBackupEnable',
  'autoBackupFrequency',
  'autoBackupLastDate',
  'autoBackupLastSize',
  'autoBackupNextDate',
  'autoBackupPath'
];

class Account {
  initialize(loggedAccounts) {
    this.activeAccount = loggedAccounts.find(account => account.isActive);
    this.inactiveAccounts = loggedAccounts.filter(account => !account.isActive);

    if (!this.activeAccount) {
      this.activeAccount = loggedAccounts[0];
      this.inactiveAccounts = loggedAccounts.slice(0);
    }
  }

  get id() {
    return this.activeAccount.id;
  }
  get recipientId() {
    if (!this.activeAccount) return;
    return this.activeAccount.recipientId;
  }
  get name() {
    return this.activeAccount.name;
  }
  get jwt() {
    return this.activeAccount.jwt;
  }
  get privKey() {
    return this.activeAccount.privKey;
  }
  get registrationId() {
    return this.activeAccount.registrationId;
  }
  get deviceId() {
    return this.activeAccount.deviceId;
  }
  get signature() {
    return this.activeAccount.signature;
  }
  get signatureEnabled() {
    return this.activeAccount.signatureEnabled;
  }
  get signFooter() {
    return this.activeAccount.signFooter;
  }
  get encryptToExternals() {
    return this.activeAccount.encryptToExternals;
  }
  get autoBackupEnable() {
    return this.activeAccount.autoBackupEnable;
  }
  get autoBackupFrequency() {
    return this.activeAccount.autoBackupFrequency;
  }
  get autoBackupLastDate() {
    return this.activeAccount.autoBackupLastDate;
  }
  get autoBackupLastSize() {
    return this.activeAccount.autoBackupLastSize;
  }
  get autoBackupNextDate() {
    return this.activeAccount.autoBackupNextDate;
  }
  get autoBackupPath() {
    return this.activeAccount.autoBackupPath;
  }
  get loggedAccounts() {
    return [this.activeAccount, ...this.inactiveAccounts];
  }

  get email() {
    if (!this.activeAccount) {
      throw new Error('No Active Account Available');
    }
    return this.activeAccount.recipientId.includes('@')
      ? this.activeAccount.recipientId
      : `${this.activeAccount.recipientId}@${APP_DOMAIN}`;
  }

  update(accountObj) {
    if (!this.activeAccount) return;

    const account =
      this.activeAccount.recipientId === accountObj.recipientId ||
      this.activeAccount.id === accountObj.id
        ? this.activeAccount
        : this.inactiveAccounts.find(
            mAccount =>
              mAccount.recipientId === accountObj.recipientId ||
              mAccount.id === accountObj.id
          );
    if (!account) return;

    let property;
    for (property of accountProperties) {
      account[property] =
        accountObj[property] !== undefined
          ? accountObj[property]
          : account[property];
    }
  }

  getDataForSocket() {
    const accountsData = [
      {
        jwt: this.activeAccount.jwt,
        recipientId: this.activeAccount.recipientId
      }
    ];
    if (Array.isArray(this.inactiveAccounts))
      this.inactiveAccounts.forEach(account =>
        accountsData.push({
          jwt: account.jwt,
          recipientId: account.recipientId
        })
      );

    return accountsData;
  }

  getIdentityKeyPair() {
    return {
      privKey: this.activeAccount.privKey,
      pubKey: this.activeAccount.pubKey
    };
  }
}

module.exports = new Account();
