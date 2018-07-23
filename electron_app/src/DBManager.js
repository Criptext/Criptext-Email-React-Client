const { db, cleanDataBase, createTables, Table } = require('./models.js');
const { formContactsRow } = require('./utils/dataTableUtils.js');
const { noNulls } = require('./utils/ObjectUtils');

/* Account
   ----------------------------- */
const createAccount = params => {
  return db.table(Table.ACCOUNT).insert(params);
};

const getAccount = () => {
  return db.table(Table.ACCOUNT).select('*');
};

const updateAccount = ({ opened, recipientId }) => {
  const params = {};
  if (typeof opened === 'boolean') params.opened = opened;
  return db
    .table(Table.ACCOUNT)
    .where({ recipientId })
    .update(params);
};

/* Contact
   ----------------------------- */
const createContact = params => {
  return db.table(Table.CONTACT).insert(params);
};

const createContactsIfOrNotStore = async (contacts, trx) => {
  const parsedContacts = filterUniqueContacts(formContactsRow(contacts));

  const contactsMap = parsedContacts.reduce((contactsObj, contact) => {
    contactsObj[contact.email] = contact;
    return contactsObj;
  }, {});
  const emailAddresses = Object.keys(contactsMap);

  const knex = trx || db;
  const contactsFound = await knex
    .select('*')
    .from(Table.CONTACT)
    .whereIn('email', emailAddresses);

  const contactsToUpdate = contactsFound.reduce((toUpdateArray, contact) => {
    const email = contact.email;
    const newName = contactsMap[email].name;
    if (!contact.name && newName) {
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
    await knex.insert(newContacts).into(Table.CONTACT);
  }
  if (contactsToUpdate.length) {
    await Promise.all(
      contactsToUpdate.map(contact => updateContactByEmail(contact, knex))
    );
  }
  return emailAddresses;
};

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

const getContactByEmails = (emails, trx) => {
  const knex = trx || db;
  return knex
    .select('id', 'email')
    .from(Table.CONTACT)
    .whereIn('email', emails);
};

const getContactByIds = (ids, trx) => {
  const knex = trx || db;
  return knex
    .select('id', 'email', 'name')
    .from(Table.CONTACT)
    .whereIn('id', ids);
};

const getAllContacts = () => {
  return db.select('name', 'email').from(Table.CONTACT);
};

const getContactsByEmailId = async emailId => {
  const emailContacts = await db
    .select('contactId', 'type')
    .from(Table.EMAIL_CONTACT)
    .where({ emailId });
  const toContactsId = getContactsIdByType(emailContacts, 'to');
  const ccContactsId = getContactsIdByType(emailContacts, 'cc');
  const bccContactsId = getContactsIdByType(emailContacts, 'bcc');
  const fromContactsId = getContactsIdByType(emailContacts, 'from');

  const to = await getContactByIds(toContactsId);
  const cc = await getContactByIds(ccContactsId);
  const bcc = await getContactByIds(bccContactsId);
  const from = await getContactByIds(fromContactsId);
  return { to, cc, bcc, from };
};

const getContactsIdByType = (emailContacts, type) => {
  return emailContacts
    .filter(item => item.type === type)
    .map(item => item.contactId);
};

const updateContactByEmail = ({ email, name }, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.CONTACT)
    .where({ email })
    .update({ name });
};

/* EmailContact
   ----------------------------- */
const createEmailContact = (emailContacts, trx) => {
  return trx.insert(emailContacts).into(Table.EMAIL_CONTACT);
};

const deleteEmailContactByEmailId = (emailId, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.EMAIL_CONTACT)
    .where({ emailId })
    .del();
};

/* EmailLabel
   ----------------------------- */
const createEmailLabel = async (emailLabels, trx) => {
  const knex = trx || db;
  const toInsert = await filterEmailLabelIfNotStore(emailLabels, trx);
  return knex.insert(toInsert).into(Table.EMAIL_LABEL);
};

const filterEmailLabelIfNotStore = async (emailLabels, trx) => {
  const knex = trx || db;
  const emailIds = Array.from(new Set(emailLabels.map(item => item.emailId)));
  const labelIds = Array.from(new Set(emailLabels.map(item => item.labelId)));
  const stored = await knex
    .select('*')
    .table(Table.EMAIL_LABEL)
    .whereIn('emailId', emailIds)
    .whereIn('labelId', labelIds);
  const storedEmailIds = stored.map(item => item.emailId);
  return emailLabels.filter(item => !storedEmailIds.includes(item.emailId));
};

const updateEmailLabel = ({ emailId, oldLabelId, newLabelId }) => {
  return db
    .table(Table.EMAIL_LABEL)
    .where({ emailId, labelId: oldLabelId })
    .update({ labelId: newLabelId });
};

const deleteEmailLabel = ({ emailsId, labelId }) => {
  return db
    .table(Table.EMAIL_LABEL)
    .where('labelId', labelId)
    .whereIn('emailId', emailsId)
    .del();
};

const deleteEmailLabelsByEmailId = (emailId, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.EMAIL_LABEL)
    .where({ emailId })
    .del();
};

const getEmailLabelsByEmailId = emailId => {
  return db
    .select('labelId')
    .table(Table.EMAIL_LABEL)
    .where({ emailId });
};

/* Email
   ----------------------------- */
const createEmail = async (params, trx) => {
  const knex = trx || db;
  const { recipients, email } = params;
  if (!recipients) {
    return knex.table(Table.EMAIL).insert(email);
  }
  const recipientsFrom = recipients.from || [];
  const recipientsTo = recipients.to || [];
  const recipientsCc = recipients.cc || [];
  const recipientsBcc = recipients.bcc || [];

  const emails = [
    ...recipientsFrom,
    ...recipientsTo,
    ...recipientsCc,
    ...recipientsBcc
  ];
  const emailAddresses = await createContactsIfOrNotStore(emails, trx);
  return knex
    .transaction(async trx => {
      const contactStored = await getContactByEmails(emailAddresses, trx);
      const [emailId] = await createEmail({ email: email }, trx);

      const from = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsFrom,
        type: 'from'
      });
      const to = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsTo,
        type: 'to'
      });
      const cc = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsCc,
        type: 'cc'
      });
      const bcc = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsBcc,
        type: 'bcc'
      });
      const emailContactRow = [...from, ...to, ...cc, ...bcc];
      await createEmailContact(emailContactRow, trx);

      const emailLabel = formEmailLabel({
        emailId,
        labels: params.labels
      });
      const emailLabelRow = [...emailLabel];
      await createEmailLabel(emailLabelRow, trx);

      if (params.files) {
        const files = params.files.map(file =>
          Object.assign({ emailId }, file)
        );
        await createFile(files, trx);
      }

      return emailId;
    })
    .then(emailId => {
      return [emailId];
    });
};

const formEmailContact = ({ emailId, contactStored, contacts, type }) => {
  return contacts.map(contactToSearch => {
    const emailMatched = contactToSearch.match(/<(.*)>/);
    const email = emailMatched ? emailMatched[1] : contactToSearch;
    const { id } = contactStored.find(contact => contact.email === email);
    return {
      emailId,
      contactId: id,
      type
    };
  });
};

const formEmailLabel = ({ emailId, labels }) => {
  return labels.map(labelId => {
    return {
      labelId,
      emailId
    };
  });
};

const getEmailById = id => {
  return db
    .select('*')
    .from(Table.EMAIL)
    .where({ id });
};

const getEmailByKey = key => {
  return db
    .select('*')
    .from(Table.EMAIL)
    .where({ key });
};

const getEmailsByThreadId = threadId => {
  return db
    .select(
      `${Table.EMAIL}.*`,
      db.raw(
        `GROUP_CONCAT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'from'
        THEN ${Table.EMAIL_CONTACT}.contactId ELSE NULL END) as 'from'`
      ),
      db.raw(
        `GROUP_CONCAT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'to'
        THEN ${Table.EMAIL_CONTACT}.contactId ELSE NULL END) as 'to'`
      ),
      db.raw(
        `GROUP_CONCAT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'cc'
        THEN ${Table.EMAIL_CONTACT}.contactId ELSE NULL END) as 'cc'`
      ),
      db.raw(
        `GROUP_CONCAT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'bcc'
        THEN ${Table.EMAIL_CONTACT}.contactId ELSE NULL END) as 'bcc'`
      ),
      db.raw(`GROUP_CONCAT(DISTINCT(${Table.FILE}.token)) as fileTokens`)
    )
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_CONTACT,
      `${Table.EMAIL_CONTACT}.emailId`,
      `${Table.EMAIL}.id`
    )
    .leftJoin(Table.FILE, `${Table.FILE}.emailId`, `${Table.EMAIL}.id`)
    .where({ threadId })
    .groupBy(`${Table.EMAIL}.id`);
};

const getEmailsCounterByLabelId = labelId => {
  return db(`${Table.EMAIL}`)
    .countDistinct(`${Table.EMAIL}.id as count`)
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .where(`${Table.EMAIL_LABEL}.labelId`, labelId);
};

const getEmailsGroupByThreadByParams = (params = {}) => {
  const {
    timestamp,
    subject,
    text,
    labelId,
    plain,
    limit,
    contactTypes = ['from'],
    contactFilter,
    rejectedLabelIds = []
  } = params;
  let queryDb = baseThreadQuery({
    timestamp,
    labelId,
    limit,
    contactTypes,
    contactFilter,
    rejectedLabelIds
  });

  if (plain) {
    return partThreadQueryByMatchText(queryDb, text);
  }

  if (text) {
    queryDb = queryDb
      .andWhere('preview', 'like', `%${text}%`)
      .andWhere('content', 'like', `%${text}%`);
  }
  if (subject) {
    queryDb = queryDb.andWhere('subject', 'like', `%${subject}%`);
  }

  if (labelId && labelId !== -1) {
    queryDb = queryDb.having('allLabels', 'like', `%${labelId}%`);
  }

  if (contactFilter) {
    queryDb = queryDb.havingRaw(buildMatchedContactFilterQuery(contactTypes));
  }
  return queryDb;
};

const buildMatchedContactFilterQuery = contactTypes => {
  return contactTypes.reduce((queryString, type) => {
    const tempQuery = `matchedContacts like "%${type}%"`;
    if (!queryString) {
      return tempQuery;
    }
    return `${queryString} AND ${tempQuery}`;
  }, '');
};

const buildParamsOrQuery = (builder, contactTypes) => {
  let firstIteration = true;
  contactTypes.forEach(type => {
    if (firstIteration) {
      firstIteration = false;
      builder.on(`${Table.EMAIL_CONTACT}.type`, db.raw('?', [type]));
    }
    builder.orOn(`${Table.EMAIL_CONTACT}.type`, db.raw('?', [type]));
  });
};

const buildContactMatchQuery = (contactTypes, contactFilter) => {
  if (!contactFilter) {
    return `${Table.CONTACT}.id is not null`;
  }
  return contactTypes.reduce((queryString, type) => {
    const tempQuery = `(${Table.EMAIL_CONTACT}.type = "${type}" AND (${
      Table.CONTACT
    }.name LIKE "%${contactFilter[type]}%" OR ${Table.CONTACT}.email LIKE "%${
      contactFilter[type]
    }%"))`;
    if (!queryString) {
      return tempQuery;
    }
    return queryString + ' OR ' + tempQuery;
  }, '');
};

const baseThreadQuery = ({
  timestamp,
  labelId,
  limit,
  contactTypes,
  contactFilter,
  rejectedLabelIds
}) =>
  db
    .select(
      `${Table.EMAIL}.*`,
      db.raw(`IFNULL(${Table.EMAIL}.threadId ,${Table.EMAIL}.id) as uniqueId`),
      db.raw(
        `GROUP_CONCAT(CASE WHEN ${Table.EMAIL_LABEL}.labelId <> ${labelId ||
          -1} THEN ${Table.EMAIL_LABEL}.labelId ELSE NULL END) as labels`
      ),
      db.raw(`GROUP_CONCAT(${Table.EMAIL_LABEL}.labelId) as allLabels`),
      db.raw(`GROUP_CONCAT(DISTINCT(${Table.EMAIL}.id)) as emailIds`),
      db.raw(
        `GROUP_CONCAT(DISTINCT(CASE WHEN ${buildContactMatchQuery(
          contactTypes,
          contactFilter
        )} THEN ${Table.EMAIL_CONTACT}.type ELSE NULL END)) as matchedContacts`
      ),
      db.raw(
        `GROUP_CONCAT(DISTINCT( CASE WHEN ${
          Table.CONTACT
        }.name IS NOT NULL THEN ${Table.CONTACT}.name ELSE ${
          Table.CONTACT
        }.email END)) as fromContactName`
      ),
      db.raw(`GROUP_CONCAT(DISTINCT(${Table.FILE}.token)) as fileTokens`),
      db.raw(`MAX(${Table.EMAIL}.unread) as unread`),
      db.raw(`MAX(email.date) as max_date`)
    )
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .leftJoin(
      `${Table.FILE} as file`,
      `${Table.EMAIL}.id`,
      `${Table.FILE}.emailId`
    )
    .leftJoin(Table.EMAIL_CONTACT, builder => {
      builder
        .on(`${Table.EMAIL}.id`, `${Table.EMAIL_CONTACT}.emailId`)
        .andOn(builder2 => {
          buildParamsOrQuery(builder2, contactTypes);
        });
    })
    .leftJoin(
      Table.CONTACT,
      `${Table.EMAIL_CONTACT}.contactId`,
      `${Table.CONTACT}.id`
    )
    .whereNotExists(
      db
        .select('*')
        .from(Table.EMAIL_LABEL)
        .whereRaw(
          `${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId and ${
            Table.EMAIL_LABEL
          }.labelId in (??)`,
          [rejectedLabelIds]
        )
    )
    .where(`${Table.EMAIL}.date`, '<', timestamp || 'now')
    .groupBy('uniqueId')
    .orderBy(`${Table.EMAIL}.date`, 'DESC')
    .limit(limit || 20);

const partThreadQueryByMatchText = (query, text) =>
  query.andWhere(function() {
    this.where('preview', 'like', `%${text}%`)
      .orWhere('content', 'like', `%${text}%`)
      .orWhere('subject', 'like', `%${text}%`);
  });

const deleteEmailsByIds = (ids, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.EMAIL)
    .whereIn('id', ids)
    .del();
};

const getEmailsUnredByLabelId = params => {
  const { labelId, rejectedLabelIds } = params;
  return db(`${Table.EMAIL}`)
    .select(
      db.raw(`IFNULL(${Table.EMAIL}.threadId ,${Table.EMAIL}.id) as uniqueId`),
      db.raw(`GROUP_CONCAT(${Table.EMAIL_LABEL}.labelId) as allLabels`)
    )
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .whereNotExists(
      db
        .select('*')
        .from(Table.EMAIL_LABEL)
        .whereRaw(
          `${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId and ${
            Table.EMAIL_LABEL
          }.labelId in (??)`,
          [rejectedLabelIds || []]
        )
    )
    .where('unread', 1)
    .groupBy('uniqueId')
    .having('allLabels', 'like', `%${labelId}%`);
};

const getUnreadEmailsByThreadId = threadId => {
  return db
    .select('*')
    .table(Table.EMAIL)
    .where({ threadId, unread: 1 });
};

const deleteEmailByKey = key => {
  return db
    .table(Table.EMAIL)
    .where({ key })
    .del();
};

const deleteEmailsByThreadId = threadIds => {
  return db
    .table(Table.EMAIL)
    .whereIn('threadId', threadIds)
    .del();
};

const deleteEmailLabelAndContactByEmailId = (id, optionalEmailToSave) => {
  return db.transaction(async trx => {
    await deleteEmailsByIds([id], trx);
    await deleteEmailContactByEmailId(id, trx);
    await deleteEmailLabelsByEmailId(id, trx);
    if (optionalEmailToSave) {
      await createEmail(optionalEmailToSave, trx);
    }
  });
};

const getEmailsByLabelIds = async labelIds => {
  const emails = await db
    .select('emailId')
    .from(Table.EMAIL_LABEL)
    .whereIn('labelId', labelIds);
  const emailIds = emails.map(email => email.emailId);
  return db
    .select('*')
    .table(Table.EMAIL)
    .whereIn('id', emailIds);
};

const updateEmail = ({
  id,
  key,
  threadId,
  date,
  isMuted,
  unread,
  status,
  content,
  preview
}) => {
  const params = noNulls({
    key,
    threadId,
    date,
    unread: typeof unread === 'boolean' ? unread : undefined,
    isMuted: typeof isMuted === 'boolean' ? isMuted : undefined,
    status,
    content,
    preview
  });
  const whereParam = id ? { id } : { key };
  return db
    .table(Table.EMAIL)
    .where(whereParam)
    .update(params);
};

const updateEmailByThreadId = ({ threadId, unread }) => {
  const params = {};
  if (typeof unread === 'boolean') params.unread = unread;
  return db
    .table(Table.EMAIL)
    .where({ threadId })
    .update(params);
};

/* Label
   ----------------------------- */
const createLabel = params => {
  return db.table(Table.LABEL).insert(params);
};

const getAllLabels = () => {
  return db.select('*').from(Table.LABEL);
};

const getLabelById = id => {
  return db
    .select('*')
    .from(Table.LABEL)
    .where({ id });
};

const updateLabel = ({ id, color, text, visible }) => {
  const params = {};
  if (color) params.color = color;
  if (text) params.text = text;
  if (typeof visible === 'boolean') params.visible = visible;
  return db
    .table(Table.LABEL)
    .where({
      id
    })
    .update(params);
};

/* File
  ----------------------------- */
const createFile = (files, trx) => {
  const knex = trx || db;
  return knex.insert(files).into(Table.FILE);
};

const getFilesByTokens = tokens => {
  return db
    .select('*')
    .from(Table.FILE)
    .whereIn('token', tokens);
};

const updateFileByToken = ({ token, status }) => {
  const params = {};
  if (status) params.status = status;
  return db
    .table(Table.FILE)
    .where({ token })
    .update(params);
};

/* Feed Item
   ----------------------------- */
const getAllFeedItems = () => {
  return db.select('*').from(Table.FEEDITEM);
};

const createFeedItem = params => {
  return db.table(Table.FEEDITEM).insert(params);
};

const updateFeedItem = ({ id, seen }) => {
  const params = {};
  if (seen) params.seen = seen;
  return db
    .table(Table.FEEDITEM)
    .where({ id })
    .update(params);
};

const deleteFeedItemById = id => {
  return db
    .table(Table.FEEDITEM)
    .where({ id })
    .del();
};

/* PreKeyRecord
   ----------------------------- */
const createPreKeyRecord = params => {
  return db.table(Table.PREKEYRECORD).insert(params);
};

const getPreKeyPair = params => {
  return db
    .select('preKeyPrivKey', 'preKeyPubKey')
    .from(Table.PREKEYRECORD)
    .where(params);
};

const deletePreKeyPair = params => {
  return db
    .table(Table.PREKEYRECORD)
    .where(params)
    .del();
};

/* SignedPreKeyRecord
   ----------------------------- */
const createSignedPreKeyRecord = params => {
  return db.table(Table.SIGNEDPREKEYRECORD).insert(params);
};

const getSignedPreKey = params => {
  return db
    .select('signedPreKeyPrivKey', 'signedPreKeyPubKey')
    .from(Table.SIGNEDPREKEYRECORD)
    .where(params);
};

/* SessionRecord
   ----------------------------- */
const createSessionRecord = params => {
  const { recipientId, deviceId } = params;
  return db
    .transaction(async trx => {
      await deleteSessionRecord({ recipientId, deviceId }, trx);
      return trx.table(Table.SESSIONRECORD).insert(params);
    })
    .then(result => {
      return result;
    });
};

const deleteSessionRecord = (params, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.SESSIONRECORD)
    .where(params)
    .del();
};

const getSessionRecord = params => {
  return db
    .select('record')
    .from(Table.SESSIONRECORD)
    .where(params);
};

const getSessionRecordByRecipientIds = recipientIds => {
  return db
    .select(
      'recipientId',
      db.raw(
        `GROUP_CONCAT(DISTINCT(${Table.SESSIONRECORD}.deviceId)) as deviceIds`
      )
    )
    .from(Table.SESSIONRECORD)
    .whereIn('recipientId', recipientIds)
    .groupBy(`${Table.SESSIONRECORD}.recipientId`);
};

/* IdentityKeyRecord
   ----------------------------- */
const getIdentityKeyRecord = params => {
  return db
    .select('identityKey')
    .from(Table.IDENTITYKEYRECORD)
    .where(params);
};

const createIdentityKeyRecord = params => {
  return db.table(Table.IDENTITYKEYRECORD).insert(params);
};

const updateIdentityKeyRecord = ({ recipientId, identityKey }) => {
  return db
    .table(Table.IDENTITYKEYRECORD)
    .where({ recipientId })
    .update({ identityKey });
};

const closeDB = () => {
  db.close();
  db.disconnect();
};

module.exports = {
  cleanDataBase,
  closeDB,
  createAccount,
  createContact,
  createFile,
  createLabel,
  createEmail,
  createEmailLabel,
  createFeedItem,
  createIdentityKeyRecord,
  createPreKeyRecord,
  createSessionRecord,
  createSignedPreKeyRecord,
  createTables,
  deleteEmailsByIds,
  deleteEmailByKey,
  deleteEmailsByThreadId,
  deleteEmailLabelAndContactByEmailId,
  deleteEmailContactByEmailId,
  deleteEmailLabel,
  deleteEmailLabelsByEmailId,
  deleteFeedItemById,
  deletePreKeyPair,
  deleteSessionRecord,
  getAccount,
  getAllContacts,
  getAllFeedItems,
  getAllLabels,
  getContactByEmails,
  getContactByIds,
  getContactsByEmailId,
  getEmailById,
  getEmailByKey,
  getEmailsByLabelIds,
  getEmailsByThreadId,
  getEmailsCounterByLabelId,
  getEmailsGroupByThreadByParams,
  getEmailsUnredByLabelId,
  getEmailLabelsByEmailId,
  getIdentityKeyRecord,
  getLabelById,
  getPreKeyPair,
  getSessionRecord,
  getSessionRecordByRecipientIds,
  getSignedPreKey,
  getFilesByTokens,
  getUnreadEmailsByThreadId,
  updateAccount,
  updateEmail,
  updateEmailByThreadId,
  updateEmailLabel,
  updateFeedItem,
  updateFileByToken,
  updateIdentityKeyRecord,
  updateLabel
};
