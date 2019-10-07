const {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Identitykeyrecord,
  Label,
  Pendingevent,
  Prekeyrecord,
  Sessionrecord,
  Settings,
  Signedprekeyrecord,
  deleteDatabase,
  getDB,
  initDatabaseEncrypted,
  resetKeyDatabase,
  Op,
  Table
} = require('./DBEmodel.js');
const { noNulls } = require('../utils/ObjectUtils');
const myAccount = require('../Account');

/* Account
----------------------------- */
const createAccount = params => {
  return Account().create(params);
};

const getAccount = () => {
  if (!getDB()) return [];
  return Account()
    .findAll()
    .map(account => account.toJSON());
};

const getAccountByParams = params => {
  if (!getDB()) return [];
  return Account().findAll({ where: params });
};

const updateAccount = ({
  deviceId,
  jwt,
  refreshToken,
  name,
  privKey,
  pubKey,
  recipientId,
  registrationId,
  signature,
  signatureEnabled,
  signFooter
}) => {
  const params = noNulls({
    deviceId,
    jwt,
    refreshToken,
    name,
    privKey,
    pubKey,
    registrationId,
    signature,
    signatureEnabled:
      typeof signatureEnabled === 'boolean' ? signatureEnabled : undefined,
    signFooter: typeof signFooter === 'boolean' ? signFooter : undefined
  });

  myAccount.update(params);
  return Account().update(params, {
    where: { recipientId: { [Op.eq]: recipientId } }
  });
};

module.exports = {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Identitykeyrecord,
  Label,
  Pendingevent,
  Prekeyrecord,
  Sessionrecord,
  Settings,
  Signedprekeyrecord,
  Table,
  createAccount,
  deleteDatabase,
  getDB,
  getAccount,
  getAccountByParams,
  initDatabaseEncrypted,
  resetKeyDatabase,
  updateAccount
};
