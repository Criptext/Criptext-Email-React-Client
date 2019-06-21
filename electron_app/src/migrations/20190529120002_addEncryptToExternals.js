const { Table } = require('./../models');

const ENCRYPT_TO_EXTERNALS_COLUMN = 'encryptToExternals';

const createEncryptToExternalsColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.ACCOUNT,
    ENCRYPT_TO_EXTERNALS_COLUMN
  );
  if (!columnExists)
    await knex.schema.table(Table.ACCOUNT, table => {
      table.boolean(ENCRYPT_TO_EXTERNALS_COLUMN).default(false);
    });
};

const deleteEncryptToExternalsScoreColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.ACCOUNT,
    ENCRYPT_TO_EXTERNALS_COLUMN
  );
  if (columnExists)
    await knex.schema.table(Table.ACCOUNT, table => {
      table.dropColumn(ENCRYPT_TO_EXTERNALS_COLUMN);
    });
};

exports.up = async function(knex, Promise) {
  const addColumn = createEncryptToExternalsColumn(knex);
  return await Promise.all([addColumn]);
};

exports.down = async function(knex, Promise) {
  const dropColumn = deleteEncryptToExternalsScoreColumn(knex);
  return await Promise.all([dropColumn]);
};
