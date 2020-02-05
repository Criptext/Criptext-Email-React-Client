const { Table, fieldTypes } = require('./../database/models');
const { SMALL_STRING_SIZE } = fieldTypes;

const createMessageIdColumn = knex => {
  return knex.schema
    .table(Table.EMAIL, table => {
      table.string('messageId', SMALL_STRING_SIZE).unique();
    })
    .then(() => {
      return knex.raw(`
      UPDATE ${Table.EMAIL}
      SET messageId = key;
    `);
    });
};

const deleteMessageIdColumn = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.dropColumn('messageId');
  });
};

exports.up = async (knex, Promise) => {
  const checkAndCreateMessageIdColumn = knex.schema
    .hasColumn(Table.EMAIL, 'messageId')
    .then(columnExists => {
      return !columnExists && createMessageIdColumn(knex);
    });
  return await Promise.all([checkAndCreateMessageIdColumn]);
};

// On Rollback
exports.down = async (knex, Promise) => {
  const checkAndDeleteMessageIdColumn = knex.schema
    .hasColumn(Table.EMAIL, 'messageId')
    .then(columnExists => {
      return columnExists && deleteMessageIdColumn(knex);
    });
  return await Promise.all([checkAndDeleteMessageIdColumn]);
};
