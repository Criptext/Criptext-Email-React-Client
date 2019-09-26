const { Table } = require('./../database/models');

const createThrashDateColumn = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.dateTime('trashDate');
  });
};

const deleteThrashDateColumn = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.dropColumn('trashDate');
  });
};

exports.up = async (knex, Promise) => {
  const checkAndCreateThrashDateColumn = knex.schema
    .hasColumn(Table.EMAIL, 'trashDate')
    .then(columnExists => {
      return !columnExists && createThrashDateColumn(knex);
    });
  return await Promise.all([checkAndCreateThrashDateColumn]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([deleteThrashDateColumn(knex)]);
};
