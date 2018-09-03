const { Table, fieldTypes } = require('./../models');
const { MEDIUM_STRING_SIZE } = fieldTypes;

const createRecoveryEmailColumn = knex => {
  return knex.schema.table(Table.ACCOUNT, table => {
    table.string('recoveryEmail', MEDIUM_STRING_SIZE).defaultTo('');
  });
};

const createRecoveryEmailConfirmedColumn = knex => {
  return knex.schema.table(Table.ACCOUNT, table => {
    table.boolean('recoveryEmailConfirmed').defaultTo(false);
  });
};

exports.up = async (knex, Promise) => {
  const checkAndCreateRecoveryEmailColumn = knex.schema
    .hasColumn(Table.ACCOUNT, 'recoveryEmail')
    .then(columnExists => {
      return !columnExists && createRecoveryEmailColumn(knex);
    });
  const checkAndCreateIsVerifiedRecoveryEmailColumn = knex.schema
    .hasColumn(Table.ACCOUNT, 'recoveryEmailConfirmed')
    .then(columnExists => {
      return !columnExists && createRecoveryEmailConfirmedColumn(knex);
    });
  return await Promise.all([
    checkAndCreateRecoveryEmailColumn,
    checkAndCreateIsVerifiedRecoveryEmailColumn
  ]);
};

// On rollback
exports.down = knex => {
  return knex.schema.table(Table.ACCOUNT, table => {
    table.dropColumn('recoveryEmail');
    table.dropColumn('recoveryEmailConfirmed');
  });
};
