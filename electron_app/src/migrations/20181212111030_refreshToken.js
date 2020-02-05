const { Table, fieldTypes } = require('./../database/models');
const { XLARGE_STRING_SIZE } = fieldTypes;

const createRefreshTokenColumn = knex => {
  return knex.schema.table(Table.ACCOUNT, table => {
    table.string('refreshToken', XLARGE_STRING_SIZE);
  });
};

const deleteRefreshTokenColumn = knex => {
  return knex.schema.table(Table.ACCOUNT, table => {
    table.dropColumn('refreshToken');
  });
};

exports.up = async (knex, Promise) => {
  const checkAndCreateRefreshTokenColumn = knex.schema
    .hasColumn(Table.ACCOUNT, 'refreshToken')
    .then(columnExists => {
      return !columnExists && createRefreshTokenColumn(knex);
    });
  return await Promise.all([checkAndCreateRefreshTokenColumn]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([deleteRefreshTokenColumn(knex)]);
};
