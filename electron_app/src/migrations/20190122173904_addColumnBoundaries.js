const { Table, fieldTypes } = require('./../models');
const { LARGE_STRING_SIZE } = fieldTypes;

const createColumn = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.string('boundary', LARGE_STRING_SIZE);
  });
};

const removeColumn = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.EMAIL, 'boundaries');
  if (columnExists)
    await knex.schema.table(Table.EMAIL, table => {
      table.dropColumn('boundary');
    });
};

exports.up = function(knex, Promise) {
  return Promise.all([createColumn(knex)]);
};

exports.down = function(knex, Promise) {
  return Promise.all([removeColumn(knex)]);
};
