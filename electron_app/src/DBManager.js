const { db, cleanDataBase, createTables, Table } = require('./models.js');

/* Account
   ----------------------------- */
const createAccount = params => {
  return db.table(Table.ACCOUNT).insert(params);
};

const getAccount = () => {
  return db.table(Table.ACCOUNT).select('*');
};

/* Contact
   ----------------------------- */
const createContact = params => {
  return db.table(Table.CONTACT).insert(params);
};

const createContactsIfOrNotStore = async contacts => {
  const emailAddresses = Array.from(
    new Set(
      contacts.map(contact => {
        const emailMatched = contact.match(/<(.*)>/);
        return emailMatched ? emailMatched[1] : contact;
      })
    )
  );

  const contactsFound = await db
    .select('email')
    .from(Table.CONTACT)
    .whereIn('email', emailAddresses);
  if (contactsFound.length === emailAddresses.length) return emailAddresses;
  const storedEmailAddresses = contactsFound.map(contact => {
    return contact.email;
  });

  const newContacts = contacts.filter(
    contact =>
      !storedEmailAddresses.includes(
        contact.match(/<(.*)>/) ? contact.match(/<(.*)>/)[1] : contact
      )
  );

  const contactsRow = newContacts.map(contact => {
    const emailMatched = contact.match(/<(.*)>/);
    const email = emailMatched ? emailMatched[1] : contact;
    const name = emailMatched
      ? contact.slice(0, contact.indexOf('<') - 1)
      : null;
    return { email, name };
  });
  const contactsRowCkecked = checkContactDuplicated(contactsRow);

  await db.insert(contactsRowCkecked).into(Table.CONTACT);
  return emailAddresses;
};

const checkContactDuplicated = contacts => {
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

const getUserByUsername = username => {
  return db
    .table(Table.CONTACT)
    .select('*')
    .where({ username });
};

const getContactByEmails = (emails, trx) => {
  return trx
    .select('id', 'email')
    .from(Table.CONTACT)
    .whereIn('email', emails);
};

const getContactByIds = ids => {
  return db
    .select('id', 'email', 'name')
    .from(Table.CONTACT)
    .whereIn('id', ids);
};

/* EmailContact
   ----------------------------- */
const createEmailContact = (emailContacts, trx) => {
  return trx.insert(emailContacts).into(Table.EMAIL_CONTACT);
};

/* EmailLabel
   ----------------------------- */
const createEmailLabel = (emailLabels, trx) => {
  const knex = trx || db;
  return knex.insert(emailLabels).into(Table.EMAIL_LABEL);
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

/* Email
   ----------------------------- */
const createEmail = async (params, trx) => {
  if (!params.recipients) {
    const knex = trx ? trx : db;
    return knex.table(Table.EMAIL).insert(params.email);
  }
  const emails = [
    ...params.recipients.from,
    ...params.recipients.to,
    ...params.recipients.cc,
    ...params.recipients.bcc
  ];
  const emailAddresses = await createContactsIfOrNotStore(emails);

  return db
    .transaction(async trx => {
      const contactStored = await getContactByEmails(emailAddresses, trx);
      const [emailId] = await createEmail({ email: params.email }, trx);
      const from = formEmailContact({
        emailId,
        contactStored,
        contacts: params.recipients.from,
        type: 'from'
      });
      const to = formEmailContact({
        emailId,
        contactStored,
        contacts: params.recipients.to,
        type: 'to'
      });
      const cc = formEmailContact({
        emailId,
        contactStored,
        contacts: params.recipients.cc,
        type: 'cc'
      });
      const bcc = formEmailContact({
        emailId,
        contactStored,
        contacts: params.recipients.bcc,
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
      )
    )
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_CONTACT,
      `${Table.EMAIL_CONTACT}.emailId`,
      `${Table.EMAIL}.id`
    )
    .where({ threadId })
    .groupBy(`${Table.EMAIL}.id`);
};

const getEmailsGroupByThreadByParams = (params = {}) => {
  const { timestamp, subject, text, labelId, plain, limit } = params;
  let queryDb = baseThreadQuery({ timestamp, labelId, limit });

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

  return queryDb;
};

const baseThreadQuery = ({ timestamp, labelId, limit }) =>
  db
    .select(
      `${Table.EMAIL}.*`,
      db.raw(
        `group_concat(CASE WHEN ${Table.EMAIL_LABEL}.labelId <> ${labelId ||
          -1} THEN ${Table.EMAIL_LABEL}.labelId ELSE NULL END) as labels`
      ),
      db.raw(`group_concat(${Table.EMAIL_LABEL}.labelId) as allLabels`),
      db.raw(`group_concat(distinct(${Table.EMAIL}.id)) as emailIds`),
      db.raw(
        `group_concat(distinct( CASE WHEN ${
          Table.CONTACT
        }.name IS NOT NULL THEN ${Table.CONTACT}.name ELSE ${
          Table.CONTACT
        }.email END)) as fromContactName`
      )
    )
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .leftJoin(Table.EMAIL_CONTACT, builder => {
      builder
        .on(`${Table.EMAIL}.id`, `${Table.EMAIL_CONTACT}.emailId`)
        .on(`${Table.EMAIL_CONTACT}.type`, db.raw('?', ['from']));
    })
    .leftJoin(
      Table.CONTACT,
      `${Table.EMAIL_CONTACT}.contactId`,
      `${Table.CONTACT}.id`
    )
    .where('date', '<', timestamp || 'now')
    .groupBy('threadId')
    .orderBy('date', 'DESC')
    .limit(limit || 20);

const partThreadQueryByMatchText = (query, text) =>
  query.andWhere(function() {
    this.where('preview', 'like', `%${text}%`)
      .orWhere('content', 'like', `%${text}%`)
      .orWhere('subject', 'like', `%${text}%`);
  });

const markThreadAsRead = threadId => {
  return db
    .table(Table.EMAIL)
    .where({
      threadId
    })
    .update({
      unread: false
    });
};

const deleteEmail = emailKey => {
  return db
    .table(Table.EMAIL)
    .where({
      key: emailKey
    })
    .del();
};

const getEmailById = id => {
  return db
    .select('*')
    .from(Table.EMAIL)
    .where({ id });
};

const updateEmail = ({ id, key, threadId, date, isMuted }) => {
  const params = {};
  if (key) params.key = key;
  if (threadId) params.threadId = threadId;
  if (date) params.date = date;
  if (typeof isMuted === 'boolean') params.isMuted = isMuted;
  return db
    .table(Table.EMAIL)
    .where({ id })
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

const updateLabel = ({ id, color, text }) => {
  const params = {};
  if (color) params.color = color;
  if (text) params.text = text;
  return db
    .table(Table.LABEL)
    .where({
      id
    })
    .update(params);
};

/* Feed
   ----------------------------- */
const getAllFeeds = () => {
  return db.select('*').from(Table.FEED);
};

const createFeed = params => {
  return db.table(Table.FEED).insert(params);
};

const updateFeed = ({ id, unread }) => {
  const params = {};
  if (unread) params.unread = unread;
  return db
    .table(Table.FEED)
    .where({ id })
    .update(params);
};

const deleteFeedById = id => {
  return db
    .table(Table.FEED)
    .where({ id })
    .del();
};

/* KeyRecord
   ----------------------------- */
const createKeys = params => {
  return db.table(Table.KEYRECORD).insert(params);
};

const getKeys = params => {
  return db
    .select('*')
    .from(Table.KEYRECORD)
    .where(params);
};

const getPreKeyPair = params => {
  return db
    .select('preKeyPrivKey', 'preKeyPubKey')
    .from(Table.KEYRECORD)
    .where(params);
};

const getSignedPreKey = params => {
  return db
    .select('signedPrivKey', 'signedPubKey')
    .from(Table.KEYRECORD)
    .where(params);
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
  createLabel,
  createEmail,
  createEmailLabel,
  createFeed,
  createKeys,
  createTables,
  deleteEmail,
  deleteEmailLabel,
  deleteFeedById,
  getAccount,
  getAllFeeds,
  getAllLabels,
  getContactByIds,
  getEmailById,
  getEmailsByThreadId,
  getEmailsGroupByThreadByParams,
  getKeys,
  getLabelById,
  getPreKeyPair,
  getSignedPreKey,
  getUserByUsername,
  markThreadAsRead,
  updateEmail,
  updateEmailLabel,
  updateFeed,
  updateLabel
};
