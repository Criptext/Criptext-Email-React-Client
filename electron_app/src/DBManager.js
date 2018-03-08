const { db, cleanDataBase, createTables, Table } = require('./models.js');

/* Account
   ----------------------------- */
const createAccount = params => {
  return db.table(Table.ACCOUNT).insert(params);
};

const getAccount = () => {
  return db.table(Table.ACCOUNT).select('*');
};

/* Email
   ----------------------------- */
const createEmail = params => {
  return db.table(Table.EMAIL).insert(params);
};

const getEmailsByThreadId = threadId => {
  return db
    .select('*')
    .from(Table.EMAIL)
    .where({
      threadId
    });
};

const getEmailsGroupByThreadByMatchText = text => {
  return db
    .select(`${Table.EMAIL}.*`)
    .from(Table.EMAIL)
    .where('preview', 'like', `%${text}%`)
    .orWhere('content', 'like', `%${text}%`)
    .orWhere('subject', 'like', `%${text}%`)
    .groupBy('threadId')
    .orderBy('date', 'DESC')
    .limit(5);
};

const getEmailsGroupByThreadByParams = (params = {}) => {
  const { timestamp, subject, text, mailbox, plain, limit } = params;

  let queryDb = baseThreadQuery({ timestamp, mailbox, limit });

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

  if (mailbox && mailbox !== -1) {
    queryDb = queryDb.having('allLabels', 'like', `%${mailbox}%`);
  }

  return queryDb;
};

const baseThreadQuery = ({ timestamp, mailbox, limit }) =>
  db
    .select(
      `${Table.EMAIL}.*`,
      `${Table.EMAIL}.isMuted as allowNotifications`,
      db.raw(
        `group_concat(CASE WHEN ${Table.EMAIL_LABEL}.labelId <> ${mailbox ||
          -1} THEN ${Table.EMAIL_LABEL}.labelId ELSE NULL END) as labels`
      ),
      db.raw(`group_concat(${Table.EMAIL_LABEL}.labelId) as allLabels`),
      db.raw(`group_concat(distinct(${Table.EMAIL}.id)) as emails`)
    )
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
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

const updateEmail = ({ id, isMuted }) => {
  const params = {};
  if (isMuted) params.isMuted = isMuted;
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

/* Contact
   ----------------------------- */
const createContact = params => {
  return db.table(Table.CONTACT).insert(params);
};

const getUserByUsername = username => {
  return db
    .table(Table.CONTACT)
    .select('*')
    .where({ username });
};

/* Session
   ----------------------------- */
const createSession = params => {
  const { username, name, keyserverToken } = params;
  return db
    .transaction(trx => {
      return trx
        .insert({ name, username })
        .into(Table.USER)
        .then(res => {
          return trx
            .insert({
              id: STORE_SESSION_ID,
              sessionId: res[0],
              username,
              keyserverToken
            })
            .into(Table.SESSION);
        });
    })
    .then(function() {
      return true;
    })
    .catch(function() {
      return false;
    });
};

const getKeyserverToken = () => {
  return db
    .select('keyserverToken')
    .from(Table.SESSION)
    .where({ id: STORE_SESSION_ID });
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
  createFeed,
  createKeys,
  createTables,
  deleteEmail,
  deleteFeedById,
  getAccount,
  getAllFeeds,
  getAllLabels,
  getEmailById,
  getEmailsByThreadId,
  getEmailsGroupByThreadByMatchText,
  getEmailsGroupByThreadByParams,
  getKeys,
  getLabelById,
  getPreKeyPair,
  getSignedPreKey,
  getUserByUsername,
  markThreadAsRead,
  updateEmail,
  updateFeed,
  updateLabel
};
