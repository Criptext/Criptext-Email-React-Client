const { Table } = require('../models');

const createPendingEventTable = async knex => {
  const tableExists = await knex.schema.hasTable(Table.PENDINGEVENT);
  if (!tableExists) {
    return await knex.schema.createTable(Table.PENDINGEVENT, table => {
      table.increments('id').primary();
      table.text('data').notNullable();
    });
  }
};

const dropPendingEventTable = async knex => {
  return await knex.dropTableIfExists(Table.PENDINGEVENT);
};

exports.up = async (knex, Promise) => {
  return await Promise.all([createPendingEventTable(knex)]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([dropPendingEventTable(knex)]);
};
