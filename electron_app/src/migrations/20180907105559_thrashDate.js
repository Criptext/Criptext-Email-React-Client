const { Table } = require('./../models');
const systemLabels = require('./../systemLabels');

const TRIGER_NAMES = {
  AFTER_INSERT_EMAIL_LABEL_TRASH: 'after_insert_email_label_trash',
  AFTER_DELETE_EMAIL_LABEL_TRASH: 'after_delete_email_label_trash'
};

const createTriggerTrashDateAfterInsertEmailLabel = knex => {
  return knex.raw(`
    CREATE TRIGGER IF NOT EXISTS ${TRIGER_NAMES.AFTER_INSERT_EMAIL_LABEL_TRASH}
    AFTER INSERT ON ${Table.EMAIL_LABEL}
    BEGIN
      UPDATE ${Table.EMAIL}
      SET thrashDate=CURRENT_TIMESTAMP
      WHERE id=NEW.emailId AND NEW.labelId=${systemLabels.trash.id};
    END;
  `);
};

const createTriggerTrashDateAfterDeleteEmailLabel = knex => {
  return knex.raw(`
    CREATE TRIGGER IF NOT EXISTS ${TRIGER_NAMES.AFTER_DELETE_EMAIL_LABEL_TRASH}
    AFTER DELETE ON ${Table.EMAIL_LABEL}
    BEGIN
      UPDATE ${Table.EMAIL}
      SET thrashDate=NULL
      WHERE id=OLD.emailId AND OLD.labelId=${systemLabels.trash.id};
    END;
  `);
};

const createThrashDateColumn = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.dateTime('thrashDate');
  });
};

const deleteThrashDateColumn = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.dropColumn('thrashDate');
  });
};

const dropTriggerTrashDateAfterInsertEmailLabel = knex => {
  return knex.raw(
    `DROP TRIGGER IF EXISTS ${TRIGER_NAMES.AFTER_INSERT_EMAIL_LABEL_TRASH};`
  );
};

const dropTriggerTrashDateAfterDeleteEmailLabel = knex => {
  return knex.raw(
    `DROP TRIGGER IF EXISTS ${TRIGER_NAMES.AFTER_DELETE_EMAIL_LABEL_TRASH};`
  );
};

exports.up = async (knex, Promise) => {
  const checkAndCreateThrashDateColumn = knex.schema
    .hasColumn(Table.EMAIL, 'thrashDate')
    .then(columnExists => {
      return !columnExists && createThrashDateColumn(knex);
    });
  const createTriggerAfterInsert = createTriggerTrashDateAfterInsertEmailLabel(
    knex
  );
  const createTriggerAfterDelete = createTriggerTrashDateAfterDeleteEmailLabel(
    knex
  );
  return await Promise.all([
    checkAndCreateThrashDateColumn,
    createTriggerAfterInsert,
    createTriggerAfterDelete
  ]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([
    deleteThrashDateColumn(knex),
    dropTriggerTrashDateAfterInsertEmailLabel(knex),
    dropTriggerTrashDateAfterDeleteEmailLabel(knex)
  ]);
};
