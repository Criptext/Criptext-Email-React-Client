const { Table, fieldTypes, createFileKeyColumns } = require('./../models');
const { MEDIUM_STRING_SIZE } = fieldTypes;

const FILE_KEY_AFTER_DELETE_EMAIL = 'file_key_after_delete_email';

const createTriggerAfterDeleteEmail = (
  knex,
  triggerName,
  deleteFromTableName
) => {
  return knex.raw(`
    CREATE TRIGGER IF NOT EXISTS ${triggerName}
    AFTER DELETE ON ${Table.EMAIL}
    BEGIN
      DELETE FROM ${deleteFromTableName}
      WHERE ${deleteFromTableName}.emailId = OLD.id;
    END;
  `);
};

const dropTriggerAfterDeleteEmail = (knex, triggerName) => {
  return knex.raw(`DROP TRIGGER IF EXISTS ${triggerName};`);
};

const createColumn = knex => {
  return knex.schema.table(Table.FILE, table => {
    table.string('key', MEDIUM_STRING_SIZE);
    table.string('iv', MEDIUM_STRING_SIZE);
  });
};

const setKeyIvToFile = async knex => {
  return await knex.transaction(async trx => {
    const fileKeys = await trx(Table.FILE_KEY).select();
    for (const fileKey of fileKeys) {
      await trx(Table.FILE)
        .where({ emailId: fileKey.emailId })
        .update({ key: fileKey.key, iv: fileKey.iv });
    }
    await dropTriggerAfterDeleteEmail(trx, FILE_KEY_AFTER_DELETE_EMAIL);
    await trx.schema.dropTableIfExists(Table.FILE_KEY);
  });
};

const recreateFileKey = async knex => {
  await knex.schema.createTable(Table.FILE_KEY, createFileKeyColumns);
  await createTriggerAfterDeleteEmail(
    knex,
    FILE_KEY_AFTER_DELETE_EMAIL,
    Table.FILE_KEY
  );
};

const reFillFileKey = async knex => {
  return await knex.transaction(async trx => {
    const files = await trx(Table.FILE)
      .distinc('emailId')
      .select();
    for (const file of files) {
      await trx
        .insert([
          {
            key: file.key,
            iv: file.iv,
            emailId: file.emailId
          }
        ])
        .into(Table.FILE_KEY);
    }
    const columnExists = await trx.schema.hasColumn(Table.EMAIL, 'messageId');
    if (columnExists)
      await trx.schema.table(Table.EMAIL, table => {
        table.dropColumn('key');
        table.dropColumn('iv');
      });
  });
};

exports.up = (knex, Promise) => {
  const orderedMigration = createColumn(knex).then(() => {
    return setKeyIvToFile(knex);
  });
  return Promise.all([orderedMigration]);
};

exports.down = function(knex, Promise) {
  const orderedMigration = recreateFileKey(knex).then(() => {
    return reFillFileKey(knex);
  });
  return Promise.all([orderedMigration]);
};
