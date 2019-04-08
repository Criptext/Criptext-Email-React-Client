const { Table, fieldTypes } = require('./../models');
const {
  XSMALL_STRING_SIZE,
  LARGE_STRING_SIZE,
  XLARGE_STRING_SIZE
} = fieldTypes;

/*   Account table
----------------------*/
const updateAccountTable = async trx => {
  const columnIsActiveExists = await trx.schema.hasColumn(
    Table.ACCOUNT,
    'isActive'
  );
  if (columnIsActiveExists) return;

  const tempAccountTablename = `old${Table.ACCOUNT}`;
  await trx.schema.renameTable(Table.ACCOUNT, tempAccountTablename);
  await trx.schema.createTable(Table.ACCOUNT, table => {
    table.increments('id').primary();
    table.string('recipientId', XSMALL_STRING_SIZE);
    table.string('name', XSMALL_STRING_SIZE).notNullable();
    table.integer('deviceId').notNullable();
    table.string('jwt', XLARGE_STRING_SIZE).notNullable();
    table.string('refreshToken', XLARGE_STRING_SIZE);
    table.string('privKey', LARGE_STRING_SIZE).notNullable();
    table.string('pubKey', LARGE_STRING_SIZE).notNullable();
    table.integer('registrationId').notNullable();
    table.string('signature', XLARGE_STRING_SIZE).defaultTo('');
    table.boolean('signatureEnabled').defaultTo(false);
    table.integer('domain').nullable();
    table.boolean('isActive').defaultTo(false);
    table.boolean('isLoggedIn').defaultTo(true);
  });
  const prevAccountValues = await trx
    .select('*')
    .from(tempAccountTablename)
    .first();
  if (prevAccountValues) {
    const newAccountValues = Object.assign(prevAccountValues, {
      isActive: true
    });
    await trx.table(Table.ACCOUNT).insert(newAccountValues);
  }
  await trx.schema.dropTable(tempAccountTablename);
};

const rollbackAccountTable = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.ACCOUNT, 'isActive');
  if (!columnExists) return;
  return knex.schema.table(Table.ACCOUNT, table => {
    table.dropColumn('domain');
    table.dropColumn('isActive');
    table.dropColumn('isLoggedIn');
  });
};

/*   Exports
----------------------*/
exports.up = async knex => {
  return await knex.transaction(async trx => {
    await updateAccountTable(trx);
  });
};

// On Rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([rollbackAccountTable(knex)]);
};
