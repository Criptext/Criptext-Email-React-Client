const { Table } = require('./../database/models');

const SIGN_FOOTER = 'signFooter';

const createSignFooterColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.ACCOUNT, SIGN_FOOTER);
  if (!columnExists)
    await knex.schema.table(Table.ACCOUNT, table => {
      table.boolean(SIGN_FOOTER).default(true);
    });
};

const deleteSignFooterColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.ACCOUNT, SIGN_FOOTER);
  if (columnExists)
    await knex.schema.table(Table.ACCOUNT, table => {
      table.dropColumn(SIGN_FOOTER);
    });
};

exports.up = async function(knex, Promise) {
  const addColumn = createSignFooterColumn(knex);
  return await Promise.all([addColumn]);
};

exports.down = async function(knex, Promise) {
  const dropColumn = deleteSignFooterColumn(knex);
  return await Promise.all([dropColumn]);
};
