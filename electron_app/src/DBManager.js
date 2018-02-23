const { db, cleanDataBase, cleanSession, createTables, Table } = require('./models.js');

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

const closeDB = () => {
  db.close();
  db.disconnect();
};

/* User
   ----------------------------- */
const createUser = params => {
  return db.table(Table.USER).insert(params);
};

/* Session
   ----------------------------- */
const createSession = params => {
  return db.table(Table.SESSION).insert(params);
}

module.exports = {
  cleanDataBase,
  cleanSession,
  closeDB,
  createLabel,
  createEmail,
  createSession,
  createTables,
  createUser,
  deleteEmail,
  getAllLabels,
  getEmailsByThreadId,
  getEmailsGroupByThreadByMatchText,
  getEmailsGroupByThreadByParams,
  getLabelById,
  markThreadAsRead,
  updateLabel
};
