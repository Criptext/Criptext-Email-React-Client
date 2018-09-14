const { Table } = require('./../models');

const TRIGER_NAMES = {
  EMAIL_LABEL_AFTER_DELETE_EMAIL: 'email_label_after_delete_email',
  EMAIL_CONTACT_AFTER_DELETE_EMAIL: 'email_contact_after_delete_email',
  FILE_AFTER_DELETE_EMAIL: 'file_after_delete_email',
  FILE_KEY_AFTER_DELETE_EMAIL: 'file_key_after_delete_email',
  FEEDITEM_AFTER_DELETE_EMAIL: 'feeditem_after_delete_email'
};

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

exports.up = async (knex, Promise) => {
  return await Promise.all([
    createTriggerAfterDeleteEmail(
      knex,
      TRIGER_NAMES.EMAIL_LABEL_AFTER_DELETE_EMAIL,
      Table.EMAIL_LABEL
    ),
    createTriggerAfterDeleteEmail(
      knex,
      TRIGER_NAMES.EMAIL_CONTACT_AFTER_DELETE_EMAIL,
      Table.EMAIL_CONTACT
    ),
    createTriggerAfterDeleteEmail(
      knex,
      TRIGER_NAMES.FILE_AFTER_DELETE_EMAIL,
      Table.FILE
    ),
    createTriggerAfterDeleteEmail(
      knex,
      TRIGER_NAMES.FILE_KEY_AFTER_DELETE_EMAIL,
      Table.FILE_KEY
    ),
    createTriggerAfterDeleteEmail(
      knex,
      TRIGER_NAMES.FEEDITEM_AFTER_DELETE_EMAIL,
      Table.FEEDITEM
    )
  ]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([
    dropTriggerAfterDeleteEmail(
      knex,
      TRIGER_NAMES.EMAIL_LABEL_AFTER_DELETE_EMAIL
    ),
    dropTriggerAfterDeleteEmail(
      knex,
      TRIGER_NAMES.EMAIL_CONTACT_AFTER_DELETE_EMAIL
    ),
    dropTriggerAfterDeleteEmail(knex, TRIGER_NAMES.FILE_AFTER_DELETE_EMAIL),
    dropTriggerAfterDeleteEmail(knex, TRIGER_NAMES.FILE_KEY_AFTER_DELETE_EMAIL),
    dropTriggerAfterDeleteEmail(knex, TRIGER_NAMES.FEEDITEM_AFTER_DELETE_EMAIL)
  ]);
};
