const { Table } = require('./../models');

const SCORE_COLUMN = 'score';

const createScoreColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.CONTACT, SCORE_COLUMN);
  if (!columnExists)
    await knex.schema.table(Table.CONTACT, table => {
      table.integer(SCORE_COLUMN).default(0);
    });
};

const deleteScoreColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.CONTACT, SCORE_COLUMN);
  if (columnExists)
    await knex.schema.table(Table.CONTACT, table => {
      table.dropColumn(SCORE_COLUMN);
    });
};

exports.up = async function(knex, Promise) {
  const addColumn = createScoreColumn(knex);
  return await Promise.all([addColumn]);
};

exports.down = async function(knex, Promise) {
  const dropColumn = deleteScoreColumn(knex);
  return await Promise.all([dropColumn]);
};
