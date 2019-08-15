const { Table } = require('./../models');

const RECORD_COLUMN = 'record';
const RECORD_LENGTH_COLUMN = 'recordLength';
const PRE_KEY_PRIV_COLUMN = 'preKeyPrivKey';
const PRE_KEY_PUB_COLUMN = 'preKeyPubKey';
const SIGNED_PRE_KEY_PRIV_COLUMN = 'signedPreKeyPrivKey';
const SIGNED_PRE_KEY_PUB_COLUMN = 'signedPreKeyPubKey';

const createPreKeyRecordColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.PREKEYRECORD,
    RECORD_LENGTH_COLUMN
  );
  if (!columnExists)
    await knex.schema.table(Table.PREKEYRECORD, table => {
      table.dropColumn(PRE_KEY_PUB_COLUMN);
      table.dropColumn(PRE_KEY_PRIV_COLUMN);
      table.string(RECORD_COLUMN);
      table.integer(RECORD_LENGTH_COLUMN).default(0);
    });
};

const deletePreKeyRecordColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.PREKEYRECORD,
    RECORD_LENGTH_COLUMN
  );
  if (columnExists)
    await knex.schema.table(Table.PREKEYRECORD, table => {
      table.dropColumn(RECORD_COLUMN);
      table.dropColumn(RECORD_LENGTH_COLUMN);
      table.string(PRE_KEY_PUB_COLUMN);
      table.string(PRE_KEY_PRIV_COLUMN);
    });
};

const createSignedPreKeyRecordColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SIGNEDPREKEYRECORD,
    RECORD_LENGTH_COLUMN
  );
  if (!columnExists)
    await knex.schema.table(Table.SIGNEDPREKEYRECORD, table => {
      table.dropColumn(SIGNED_PRE_KEY_PUB_COLUMN);
      table.dropColumn(SIGNED_PRE_KEY_PRIV_COLUMN);
      table.string(RECORD_COLUMN);
      table.integer(RECORD_LENGTH_COLUMN);
    });
};

const deleteSignedPreKeyRecordColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SIGNEDPREKEYRECORD,
    RECORD_LENGTH_COLUMN
  );
  if (columnExists)
    await knex.schema.table(Table.SIGNEDPREKEYRECORD, table => {
      table.dropColumn(RECORD_COLUMN);
      table.dropColumn(RECORD_LENGTH_COLUMN);
      table.string(SIGNED_PRE_KEY_PUB_COLUMN);
      table.string(SIGNED_PRE_KEY_PRIV_COLUMN);
    });
};

const createSessionRecordLengthColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SESSIONRECORD,
    RECORD_LENGTH_COLUMN
  );
  if (!columnExists)
    await knex.schema.table(Table.SESSIONRECORD, table => {
      table.integer(RECORD_LENGTH_COLUMN);
    });
};

const deleteSessionRecordLengthColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SESSIONRECORD,
    RECORD_LENGTH_COLUMN
  );
  if (columnExists)
    await knex.schema.table(Table.SESSIONRECORD, table => {
      table.dropColumn(RECORD_LENGTH_COLUMN);
    });
};

const addRecordColumns = async knex => {
  await createPreKeyRecordColumn(knex);
  await createSignedPreKeyRecordColumn(knex);
  await createSessionRecordLengthColumn(knex);
};

const removeRecordColumns = async knex => {
  await deletePreKeyRecordColumn(knex);
  await deleteSignedPreKeyRecordColumn(knex);
  await deleteSessionRecordLengthColumn(knex);
};

exports.up = async function(knex, Promise) {
  const accountsCountRes = await knex.table(Table.ACCOUNT).count();
  if (accountsCountRes[0]['count(*)'] > 0) {
    return Promise.resolve();
  }
  const addRecords = addRecordColumns(knex);
  return await Promise.all([addRecords]);
};

exports.down = async function(knex, Promise) {
  const remRecords = removeRecordColumns(knex);
  return await Promise.all([remRecords]);
};
