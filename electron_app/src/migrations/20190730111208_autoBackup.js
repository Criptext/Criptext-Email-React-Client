const { Table, fieldTypes } = require('./../database/models');
const { TINY_STRING_SIZE, XLARGE_STRING_SIZE } = fieldTypes;

const AUTO_BACKUP_COLUMNS = {
  ENABLE: 'autoBackupEnable',
  FREQUENCY: 'autoBackupFrequency',
  LAST_DATE: 'autoBackupLastDate',
  LAST_SIZE: 'autoBackupLastSize',
  NEXT_DATE: 'autoBackupNextDate',
  PATH: 'autoBackupPath'
};

const createAutoBackupColumns = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SETTINGS,
    AUTO_BACKUP_COLUMNS.ENABLE
  );
  if (!columnExists) {
    const {
      ENABLE,
      FREQUENCY,
      LAST_DATE,
      LAST_SIZE,
      NEXT_DATE,
      PATH
    } = AUTO_BACKUP_COLUMNS;
    await knex.schema.table(Table.SETTINGS, table => {
      table.boolean(ENABLE).default(false);
      table.string(FREQUENCY, TINY_STRING_SIZE);
      table.dateTime(LAST_DATE);
      table.integer(LAST_SIZE);
      table.dateTime(NEXT_DATE);
      table.string(PATH, XLARGE_STRING_SIZE);
    });
  }
};

const deleteAutoBackupColumns = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SETTINGS,
    AUTO_BACKUP_COLUMNS.ENABLE
  );
  if (columnExists) {
    const {
      ENABLE,
      FREQUENCY,
      LAST_DATE,
      LAST_SIZE,
      NEXT_DATE,
      PATH
    } = AUTO_BACKUP_COLUMNS;
    await knex.schema.table(Table.SETTINGS, table => {
      table.dropColumn(ENABLE).default(false);
      table.dropColumn(FREQUENCY, TINY_STRING_SIZE);
      table.dropColumn(LAST_DATE);
      table.dropColumn(LAST_SIZE);
      table.dropColumn(NEXT_DATE);
      table.dropColumn(PATH, XLARGE_STRING_SIZE);
    });
  }
};

exports.up = async function(knex, Promise) {
  return await Promise.all([createAutoBackupColumns(knex)]);
};

exports.down = async function(knex, Promise) {
  return await Promise.all([deleteAutoBackupColumns(knex)]);
};
