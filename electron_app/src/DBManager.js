const { db, createTables, Table } = require('./models.js');

const getEmailsByThreadId = function(threadId) {
  return db
    .select('*')
    .from(Table.EMAIL)
    .where({
      threadId
    });
};

const getThreads = function(timestamp, limit, offset) {
  return db
    .select(
      `${Table.EMAIL}.*`,
      `${Table.EMAIL}.isMuted as allowNotifications`,
      db.raw(
        `group_concat(CASE WHEN ${Table.LABEL}.id <> 1 THEN ${
          Table.LABEL
        }.id ELSE NULL END) as labels`
      ),
      db.raw(`group_concat(distinct(${Table.EMAIL}.id)) as emails`)
    )
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .leftJoin(Table.LABEL, `${Table.EMAIL_LABEL}.labelId`, `${Table.LABEL}.id`)
    .where('date', '<', timestamp || 'now')
    .groupBy('threadId')
    .orderBy('date', 'DESC')
    .limit(limit || 20)
    .offset(offset || 0);
};

const getAllLabels = function() {
  return db.select('*').from(Table.LABEL);
};

const addEmail = function(params) {
  return db.table(Table.EMAIL).insert(params);
};

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

const closeDB = function() {
  db.close();
  db.disconnect();
};

module.exports = {
  createTables,
  getEmailsByThreadId,
  addEmail,
  markThreadAsRead,
  deleteEmail,
  closeDB,
  getThreads,
  getAllLabels
};
