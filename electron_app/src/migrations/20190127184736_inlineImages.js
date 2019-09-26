const { Table, fieldTypes } = require('./../database/models');
const { SMALL_STRING_SIZE } = fieldTypes;

const createCidColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.FILE, 'cid');
  if (!columnExists)
    await knex.schema.table(Table.FILE, table => {
      table.string('cid', SMALL_STRING_SIZE);
    });
};

const deleteCidColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.FILE, 'cid');
  if (columnExists)
    await knex.schema.table(Table.FILE, table => {
      table.dropColumn('cid');
    });
};

exports.up = async (knex, Promise) => {
  return await Promise.all([createCidColumn(knex)]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([deleteCidColumn(knex)]);
};
