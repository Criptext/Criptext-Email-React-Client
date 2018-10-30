const { Table } = require('./../models');

exports.up = (knex, Promise) => {
  return Promise.resolve(knex);
};

// On rollback
exports.down = async knex => {
  const hasRecoveryEmailColumn = await knex.schema.hasColumn(
    Table.ACCOUNT,
    'recoveryEmail'
  );
  if (hasRecoveryEmailColumn) {
    await knex.schema.table(Table.ACCOUNT, table => {
      table.dropColumn('recoveryEmail');
      table.dropColumn('recoveryEmailConfirmed');
    });
  }
};
