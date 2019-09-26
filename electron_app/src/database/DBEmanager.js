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
  getDB,
  initDatabaseEncrypted,
  Table
} = require('./DBEmodel.js');

const getAccount = () => {
  const db = getDB();
  if (!db) return [];
};

const getAccountByParams = () => {
  const db = getDB();
  if (!db) return [];
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
  getDB,
  initDatabaseEncrypted,
  getAccount,
  getAccountByParams
};
