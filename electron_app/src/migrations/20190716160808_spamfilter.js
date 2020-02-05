const { Table } = require('./../database/models');

const SPAM_SCORE_COLUMN = 'spamScore';

const createSpamScoreColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.CONTACT,
    SPAM_SCORE_COLUMN
  );
  if (!columnExists)
    await knex.schema.table(Table.CONTACT, table => {
      table.integer(SPAM_SCORE_COLUMN).default(0);
    });
};

const deleteSpamScoreColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.CONTACT,
    SPAM_SCORE_COLUMN
  );
  if (columnExists)
    await knex.schema.table(Table.CONTACT, table => {
      table.dropColumn(SPAM_SCORE_COLUMN);
    });
};

exports.up = async function(knex, Promise) {
  const addColumn = createSpamScoreColumn(knex);
  return await Promise.all([addColumn]);
};

exports.down = async function(knex, Promise) {
  const dropColumn = deleteSpamScoreColumn(knex);
  return await Promise.all([dropColumn]);
};
