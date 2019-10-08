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
const { formContactsRow } = require('../utils/dataTableUtils.js');
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

/* Contact
----------------------------- */
const createContact = params => {
  return Contact().bulkCreate(params);
};

const createContactsIfOrNotStore = async (contacts, trx) => {
  const parsedContacts = filterUniqueContacts(formContactsRow(contacts));
  const contactsMap = parsedContacts.reduce((contactsObj, contact) => {
    contactsObj[contact.email] = contact;
    return contactsObj;
  }, {});
  const emailAddresses = Object.keys(contactsMap);
  const contactsFound = await Contact().findAll({
    where: { email: emailAddresses },
    transaction: trx
  });
  const contactsToUpdate = contactsFound.reduce((toUpdateArray, contact) => {
    const email = contact.email;
    const newName = contactsMap[email].name || contact.name;
    if (newName !== contact.name) {
      toUpdateArray.push({ email, name: newName });
    }
    return toUpdateArray;
  }, []);

  const storedEmailAddresses = contactsFound.map(
    storedContact => storedContact.email
  );
  const newContacts = parsedContacts.filter(
    contact => !storedEmailAddresses.includes(contact.email)
  );

  if (newContacts.length) {
    await Contact().bulkCreate(newContacts, { transaction: trx });
  }
  if (contactsToUpdate.length) {
    await Promise.all(
      contactsToUpdate.map(contact => updateContactByEmail(contact, trx))
    );
  }
  return emailAddresses;
};

const getAllContacts = () => {
  return Contact().findAll({
    attributes: ['name', 'email'],
    order: [['score', 'DESC'], ['name']],
    raw: true
  });
};

const getContactByEmails = (emails, trx) => {
  return Contact().findAll({
    attributes: ['id', 'email', 'score', 'spamScore'],
    where: { email: emails },
    transaction: trx
  });
};

const getContactByIds = (ids, trx) => {
  return Contact().findAll({
    attributes: ['id', 'email', 'name'],
    where: { id: ids },
    raw: true,
    transaction: trx
  });
};

const updateContactByEmail = ({ email, name }, trx) => {
  return Contact().update(
    { name },
    { where: { email: { [Op.eq]: email } }, transaction: trx }
  );
};

/* Functions
----------------------------- */
const filterUniqueContacts = contacts => {
  const contactsUnique = contacts.reduce(
    (result, contact) => {
      const obj = Object.assign(result);
      if (!result.stack[contact.email]) {
        obj.stack[contact.email] = contact;
        obj.contacts.push(contact);
      }
      return obj;
    },
    { stack: {}, contacts: [] }
  );
  return contactsUnique.contacts;
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
  createContact,
  createContactsIfOrNotStore,
  deleteDatabase,
  getDB,
  getAccount,
  getAccountByParams,
  getAllContacts,
  getContactByEmails,
  getContactByIds,
  initDatabaseEncrypted,
  resetKeyDatabase,
  updateAccount,
  updateContactByEmail
};
