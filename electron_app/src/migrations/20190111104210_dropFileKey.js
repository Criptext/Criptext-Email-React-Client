const { Table, fieldTypes, recreateFileKey } = require('./../models');
const { MEDIUM_STRING_SIZE } = fieldTypes;

const createColumn = knex => {
  return knex.schema
    .table(Table.FILE, table => {
      table.string('key', MEDIUM_STRING_SIZE).unique();
      table.string('iv', MEDIUM_STRING_SIZE).unique();
    })
};

const setKeyIvToFile = knex => {
  return await knex.transaction(async trx => {
    const fileKeys = await trx(Table.FILE_KEY).select();
    for (const fileKey of fileKeys) {
      await trx(Table.FILE).where({emailId: fileKey.emailId}).update({key: key, iv: iv})
    }
    trx.schema.dropTableIfExists(Table.FILE_KEY)
  });
}

const recreateFileKey = knex => {
  return knex.schema.createTable(Table.FILE_KEY, createFileKeyColumns)
}

const reFillFileKey = knex => {
  return await knex.transaction(async trx => {
    const files = await trx(Table.FILE).distinc(emailId).select();
    for (const file of files) {
      await trx.insert([{
        key: file.key,
        iv: file.iv,
        emailId: file.emailId
      }]).into(Table.FILE_KEY);
    }
    const columnExists = await trx.schema.hasColumn(Table.EMAIL, 'messageId')
    if (columnExists) 
      await trx.schema.table(Table.EMAIL, table => {
        table.dropColumn('key');
        table.dropColumn('iv');
      });
  });
}

exports.up = (knex, Promise) => {
  const orderedMigration = createColumn(knex).then(() => {
    return setKeyIvToFile(knex)
  })
  return Promise.all([orderedMigration])
};

exports.down = function(knex, Promise) {
  const orderedMigration = recreateFileKey(knex).then(() => {
    return reFillFileKey(knex)
  })
  return Promise.all([orderedMigration])
};
