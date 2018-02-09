const { db, createTables, Table } = require('./models.js');

/* Email
   ----------------------------- */
const addEmail = function(params) {
  return db.table(Table.EMAIL).insert(params);
};

const getEmailsByThreadId = function(threadId) {
  return db
    .select('*')
    .from(Table.EMAIL)
    .where({
      threadId
    });
};

const getEmailsGroupByThreadByMatchText = function(text) {
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

const getEmailsGroupByThreadByParams = function(params = {}) {
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

const markThreadAsRead = function(threadId) {
  return db
    .table(Table.EMAIL)
    .where({
      threadId
    })
    .update({
      unread: false
    });
};

const deleteEmail = function(emailKey) {
  return db
    .table(Table.EMAIL)
    .where({
      key: emailKey
    })
    .del();
};

/* Label
   ----------------------------- */
const getAllLabels = function() {
  return db.select('*').from(Table.LABEL);
};

const closeDB = function() {
  db.close();
  db.disconnect();
};

module.exports = {
  addEmail,
  createTables,
  closeDB,
  deleteEmail,
  getAllLabels,
  getEmailsByThreadId,
  getEmailsGroupByThreadByParams,
  markThreadAsRead,
  getEmailsGroupByThreadByMatchText
};
