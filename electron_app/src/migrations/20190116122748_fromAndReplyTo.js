const { Table, fieldTypes } = require('./../models');
const { MEDIUM_STRING_SIZE } = fieldTypes;
const { formContactsRow } = require('./../utils/dataTableUtils');

const batch = 1;

const createFromColumn = async knex => {
  await knex.schema.table(Table.EMAIL, table => {
    table
      .string('fromAddress', MEDIUM_STRING_SIZE)
      .notNullable()
      .defaultTo('');
  });
  return await updateFromColumn(knex);
};
const createReplyToColumn = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.string('replyTo', MEDIUM_STRING_SIZE).nullable();
  });
};
const updateFromColumn = async knex => {
  let shouldGetMoreEmailContacts = true;
  let offset = 0,
    limit = batch;
  while (shouldGetMoreEmailContacts) {
    const fromEmailContacts = await knex
      .select('*')
      .from(Table.EMAIL_CONTACT)
      .where('type', 'from')
      .limit(limit)
      .offset(offset);
    if (!fromEmailContacts.length) {
      shouldGetMoreEmailContacts = false;
      break;
    }

    for (const emailContact of fromEmailContacts) {
      const [contact] = await knex
        .select('*')
        .from(Table.CONTACT)
        .where({ id: emailContact.emailId });
      await knex
        .table(Table.EMAIL)
        .update({
          from: `${
            contact.name ? `${contact.name} <${contact.email}>` : contact.email
          }`
        })
        .where({ id: emailContact.emailId });
    }
    limit += batch;
    offset += batch;
  }
};

const recreateRelation = async knex => {
  let shouldGetMoreEmails = true;
  let offset = 0,
    limit = batch;

  while (shouldGetMoreEmails) {
    const emails = await knex
      .select('id, from')
      .from(Table.EMAIL)
      .limit(limit)
      .offset(offset);
    if (!emails.length) {
      shouldGetMoreEmails = false;
      break;
    }

    for (const email of emails) {
      const [parsedContact] = formContactsRow([email]);
      const [id] = await knex.insert(parsedContact).into(Table.CONTACT);
      await knex
        .insert({ emailId: email.id, contactId: id })
        .into(Table.EMAIL_CONTACT);
    }
    limit += batch;
    offset += batch;
  }
  await deleteFromAndReplyToColumns(knex);
};
const deleteFromAndReplyToColumns = knex => {
  return knex.schema.table(Table.EMAIL, table => {
    table.dropColumn('fromAddress');
    table.dropColumn('replyTo');
  });
};

exports.up = async (knex, Promise) => {
  const checkAndCreateFromColumn = knex.schema
    .hasColumn(Table.EMAIL, 'fromAddress')
    .then(columnExists => {
      return !columnExists && createFromColumn(knex);
    });
  const checkAndCreateReplyToColumn = knex.schema
    .hasColumn(Table.EMAIL, 'replyTo')
    .then(columnExists => {
      return !columnExists && createReplyToColumn(knex);
    });

  return await Promise.all([
    checkAndCreateFromColumn,
    checkAndCreateReplyToColumn
  ]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([recreateRelation(knex)]);
};
