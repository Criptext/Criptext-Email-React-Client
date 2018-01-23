const { db, createTables } = require('./models.js');

const getRows = function(table, where) {
  return db
    .select('*')
    .from(table)
    .where(where);
};

const insertRows = function(table, params) {
  return db.table(table).insert(params);
};

const updateRows = function(table, params, where) {
  return db
    .table(table)
    .where(where)
    .update(params);
};

const deleteRows = function(table, where) {
  return db
    .table(table)
    .where(where)
    .del();
};

const closeDB = function() {
  db.close();
  db.disconnect();
};

module.exports = {
  createTables,
  getRows,
  insertRows,
  updateRows,
  deleteRows,
  closeDB
};
