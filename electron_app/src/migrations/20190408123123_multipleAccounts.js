const { Table, fieldTypes } = require('./../models');
const {
  TINY_STRING_SIZE,
  XSMALL_STRING_SIZE,
  LARGE_STRING_SIZE,
  MEDIUM_STRING_SIZE,
  SMALL_STRING_SIZE,
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
    table.boolean('isActive').defaultTo(true);
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

/*   Account Contact table
------------------------------*/
const createAccountContactTable = async (trx, accountId) => {
  const tableExists = await trx.schema.hasTable(Table.ACCOUNT_CONTACT);
  if (tableExists) return;

  await trx.schema.createTable(Table.ACCOUNT_CONTACT, table => {
    table.increments('id').primary();
    table.integer('accountId').notNullable();
    table.integer('contactId').notNullable();
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
  });
  if (!accountId) return;

  let shouldGetMoreContacIds = true;
  const batch = 100;
  let minId = 0,
    maxId = batch;
  do {
    const ids = await trx
      .select('id')
      .from(Table.CONTACT)
      .whereBetween('id', [minId, maxId]);
    if (ids.length > 0) {
      const accountContactsToInsert = ids.map(row => ({
        accountId,
        contactId: row.id
      }));
      await trx.table(Table.ACCOUNT_CONTACT).insert(accountContactsToInsert);
      minId += batch;
      maxId += batch;
    } else {
      shouldGetMoreContacIds = false;
    }
  } while (shouldGetMoreContacIds);
};

const rollbackAccountContactTable = knex => {
  return knex.schema.dropTableIfExists(Table.ACCOUNT_CONTACT);
};

/*   Email table
----------------------*/
const addAccountIdToEmailTable = async (trx, accountId) => {
  const columnAccountIdExists = await trx.schema.hasColumn(
    Table.EMAIL,
    'accountId'
  );
  if (columnAccountIdExists) return;
  // Duplicate table
  const tempTablename = `old${Table.EMAIL}`;
  await trx.schema.renameTable(Table.EMAIL, tempTablename);
  await trx.schema.createTable(Table.EMAIL, table => {
    table.increments('id').primary();
    table.string('key', SMALL_STRING_SIZE).notNullable();
    table.string('threadId', SMALL_STRING_SIZE);
    table.string('s3Key', SMALL_STRING_SIZE);
    table.string('subject').notNullable();
    table.text('content').notNullable();
    table.string('preview', LARGE_STRING_SIZE).notNullable();
    table.dateTime('date').notNullable();
    table.integer('status').notNullable();
    table.boolean('unread').notNullable();
    table.boolean('secure').notNullable();
    table.boolean('isMuted').notNullable();
    table.dateTime('unsendDate');
    table.dateTime('trashDate');
    table.string('messageId', SMALL_STRING_SIZE);
    table
      .string('fromAddress', MEDIUM_STRING_SIZE)
      .notNullable()
      .defaultTo('');
    table.string('replyTo', MEDIUM_STRING_SIZE).nullable();
    table.string('boundary', LARGE_STRING_SIZE);
    table.integer('accountId');
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
  });
  // Insert values
  const prevValues = await trx.select('*').from(tempTablename);
  if (prevValues.length) {
    await trx.table(Table.EMAIL).insert(prevValues);
  }
  await trx.schema.dropTable(tempTablename);
  if (accountId) {
    await trx.raw(`UPDATE ${Table.EMAIL} SET accountId = ${accountId};`);
  }
};

const rollbackEmailTable = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.EMAIL, 'accountId');
  if (!columnExists) return;
  return knex.schema.table(Table.EMAIL, table => {
    table.dropColumn('accountId');
  });
};

/*   Label table
---------------------*/
const addAccountIdToLabelTable = async (trx, accountId) => {
  const columnAccountIdExists = await trx.schema.hasColumn(
    Table.LABEL,
    'accountId'
  );
  if (columnAccountIdExists) return;
  // Duplicate table
  const tempTablename = `old${Table.LABEL}`;
  await trx.schema.renameTable(Table.LABEL, tempTablename);
  await trx.schema.createTable(Table.LABEL, table => {
    table.increments('id').primary();
    table.string('text', MEDIUM_STRING_SIZE).notNullable();
    table.string('color', TINY_STRING_SIZE).notNullable();
    table.string('type', TINY_STRING_SIZE).defaultTo('custom');
    table.boolean('visible').defaultTo(true);
    table.uuid('uuid').notNullable();
    table.integer('accountId');
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
    table.unique(['text', 'accountId']);
  });
  // Insert values
  const prevValues = await trx.select('*').from(tempTablename);
  if (prevValues.length) {
    await trx.table(Table.LABEL).insert(prevValues);
  }
  await trx.schema.dropTable(tempTablename);
  await trx
    .table(Table.LABEL)
    .where({ type: 'system' })
    .update({ accountId: null });
  if (accountId) {
    await trx
      .table(Table.LABEL)
      .where({ type: 'custom' })
      .update({ accountId });
  }
};

const rollbackLabelTable = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.LABEL, 'accountId');
  if (!columnExists) return;
  return knex.schema.table(Table.LABEL, table => {
    table.dropColumn('accountId');
  });
};

/*   EmailLabel table
--------------------------*/
const updateEmailLabelTable = async trx => {
  const tempTablename = `old${Table.EMAIL_LABEL}`;
  await trx.schema.renameTable(Table.EMAIL_LABEL, tempTablename);
  await trx.schema.createTable(Table.EMAIL_LABEL, table => {
    table.increments('id').primary();
    table.integer('labelId').notNullable();
    table.string('emailId', SMALL_STRING_SIZE).notNullable();
    table
      .foreign('labelId')
      .references('id')
      .inTable(Table.LABEL);
    table
      .foreign('emailId')
      .references('id')
      .inTable(Table.EMAIL);
  });
  const prevValues = await trx.select('*').from(tempTablename);
  if (prevValues.length) {
    await trx.table(Table.EMAIL_LABEL).insert(prevValues);
  }
  await trx.schema.dropTable(tempTablename);
};

const rollbackEmailLabelTable = async knex => {
  await knex.schema.table(Table.EMAIL_LABEL, table => {
    table.unique(['emailId', 'labelId']);
  });
};

/*   Pending event
-----------------------*/
const addAccountIdToPendingEventTable = async (trx, accountId) => {
  const columnAccountIdExists = await trx.schema.hasColumn(
    Table.PENDINGEVENT,
    'accountId'
  );
  if (columnAccountIdExists) return;
  await trx.schema.table(Table.PENDINGEVENT, table => {
    table.integer('accountId');
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
  });
  if (accountId) {
    await trx.raw(`UPDATE ${Table.PENDINGEVENT} SET accountId = ${accountId};`);
  }
};

const rollbackPendingEventTable = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.PENDINGEVENT,
    'accountId'
  );
  if (!columnExists) return;
  return knex.schema.table(Table.PENDINGEVENT, table => {
    table.dropColumn('accountId');
  });
};

/*   IdentityKeyRecord table
--------------------------------*/
const addAccountIdToIdentityKeyRecordTable = async (trx, accountId) => {
  const columnAccountIdExists = await trx.schema.hasColumn(
    Table.IDENTITYKEYRECORD,
    'accountId'
  );
  if (columnAccountIdExists) return;
  // Duplicate table
  const tempTablename = `old${Table.IDENTITYKEYRECORD}`;
  await trx.schema.renameTable(Table.IDENTITYKEYRECORD, tempTablename);
  await trx.schema.createTable(Table.IDENTITYKEYRECORD, table => {
    table.increments('id').primary();
    table.string('recipientId', XSMALL_STRING_SIZE).notNullable();
    table.integer('deviceId').notNullable();
    table.string('identityKey', LARGE_STRING_SIZE).notNullable();
    table.integer('accountId');
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
  });
  // Insert values
  const prevValues = await trx.select('*').from(tempTablename);
  if (prevValues.length) {
    await trx.table(Table.IDENTITYKEYRECORD).insert(prevValues);
  }
  await trx.schema.dropTable(tempTablename);
  if (accountId) {
    await trx.raw(
      `UPDATE ${Table.IDENTITYKEYRECORD} SET accountId = ${accountId};`
    );
  }
};

const rollbackIdentityKeyRecordTable = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.IDENTITYKEYRECORD,
    'accountId'
  );
  if (!columnExists) return;
  return knex.schema.table(Table.IDENTITYKEYRECORD, table => {
    table.dropColumn('accountId');
  });
};

/*   PreKeyRecord table
--------------------------*/
const addAccountIdToPreKeyRecordTable = async (trx, accountId) => {
  const columnAccountIdExists = await trx.schema.hasColumn(
    Table.PREKEYRECORD,
    'accountId'
  );
  if (columnAccountIdExists) return;
  // Duplicate table
  const tempTablename = `old${Table.PREKEYRECORD}`;
  await trx.schema.renameTable(Table.PREKEYRECORD, tempTablename);
  await trx.schema.createTable(Table.PREKEYRECORD, table => {
    table.increments('id').primary();
    table.integer('preKeyId').notNullable();
    table.string('preKeyPrivKey', LARGE_STRING_SIZE).notNullable();
    table.string('preKeyPubKey', LARGE_STRING_SIZE).notNullable();
    table.integer('accountId');
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
  });
  // Insert values
  const prevValues = await trx.select('*').from(tempTablename);
  if (prevValues.length) {
    await trx.table(Table.PREKEYRECORD).insert(prevValues);
  }
  await trx.schema.dropTable(tempTablename);
  if (accountId) {
    await trx.raw(`UPDATE ${Table.PREKEYRECORD} SET accountId = ${accountId};`);
  }
};

const rollbackPreKeyRecordTable = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.PREKEYRECORD,
    'accountId'
  );
  if (!columnExists) return;
  return knex.schema.table(Table.PREKEYRECORD, table => {
    table.dropColumn('accountId');
  });
};

/*   SessionRecord table
---------------------------*/
const addAccountIdToSessionRecordTable = async (trx, accountId) => {
  const columnAccountIdExists = await trx.schema.hasColumn(
    Table.SESSIONRECORD,
    'accountId'
  );
  if (columnAccountIdExists) return;
  // Duplicate table
  const tempTablename = `old${Table.SESSIONRECORD}`;
  await trx.schema.renameTable(Table.SESSIONRECORD, tempTablename);
  await trx.schema.createTable(Table.SESSIONRECORD, table => {
    table.increments('id').primary();
    table.string('recipientId', XSMALL_STRING_SIZE).notNullable();
    table.integer('deviceId').notNullable();
    table.text('record').notNullable();
    table.integer('accountId');
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
  });
  // Insert values
  const prevValues = await trx.select('*').from(tempTablename);
  if (prevValues.length) {
    await trx.table(Table.SESSIONRECORD).insert(prevValues);
  }
  await trx.schema.dropTable(tempTablename);
  if (accountId) {
    await trx.raw(
      `UPDATE ${Table.SESSIONRECORD} SET accountId = ${accountId};`
    );
  }
};

const rollbackSessionRecordTable = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SESSIONRECORD,
    'accountId'
  );
  if (!columnExists) return;
  return knex.schema.table(Table.SESSIONRECORD, table => {
    table.dropColumn('accountId');
  });
};

/*   SignedPreKeyRecord table
--------------------------------*/
const addAccountIdToSignedPreKeyRecordTable = async (trx, accountId) => {
  const columnAccountIdExists = await trx.schema.hasColumn(
    Table.SIGNEDPREKEYRECORD,
    'accountId'
  );
  if (columnAccountIdExists) return;
  // Duplicate table
  const tempTablename = `old${Table.SIGNEDPREKEYRECORD}`;
  await trx.schema.renameTable(Table.SIGNEDPREKEYRECORD, tempTablename);
  await trx.schema.createTable(Table.SIGNEDPREKEYRECORD, table => {
    table.increments('id').primary();
    table.integer('signedPreKeyId').notNullable();
    table.string('signedPreKeyPrivKey', LARGE_STRING_SIZE).notNullable();
    table.string('signedPreKeyPubKey', LARGE_STRING_SIZE).notNullable();
    table.integer('accountId');
    table
      .foreign('accountId')
      .references('id')
      .inTable(Table.ACCOUNT);
  });
  // Insert values
  const prevValues = await trx.select('*').from(tempTablename);
  if (prevValues.length) {
    await trx.table(Table.SIGNEDPREKEYRECORD).insert(prevValues);
  }
  await trx.schema.dropTable(tempTablename);
  if (accountId) {
    await trx.raw(
      `UPDATE ${Table.SIGNEDPREKEYRECORD} SET accountId = ${accountId};`
    );
  }
};

const rollbackSignedPreKeyRecordTable = async knex => {
  const columnExists = await knex.schema.hasColumn(
    Table.SIGNEDPREKEYRECORD,
    'accountId'
  );
  if (!columnExists) return;
  return knex.schema.table(Table.SIGNEDPREKEYRECORD, table => {
    table.dropColumn('accountId');
  });
};

/*   Triggers
----------------------*/
const TRIGERS = {
  EMAIL_AFTER_DELETE_ACCOUNT: {
    name: 'email_after_delete_account',
    table: Table.EMAIL
  },
  LABEL_AFTER_DELETE_ACCOUNT: {
    name: 'label_after_delete_account',
    table: Table.LABEL
  },
  PENDING_EVENT_AFTER_DELETE_ACCOUNT: {
    name: 'pending_event_after_delete_account',
    table: Table.PENDINGEVENT
  },
  ACCOUNT_CONTACT_AFTER_DELETE_ACCOUNT: {
    name: 'account_contact_after_delete_account',
    table: Table.ACCOUNT_CONTACT
  },
  IDENTITYKEYRECORD_AFTER_DELETE_ACCOUNT: {
    name: 'identitykeyrecord_after_delete_account',
    table: Table.IDENTITYKEYRECORD
  },
  PREKEYRECORD_AFTER_DELETE_ACCOUNT: {
    name: 'prekeyrecord_after_delete_account',
    table: Table.PREKEYRECORD
  },
  SESSIONRECORD_AFTER_DELETE_ACCOUNT: {
    name: 'sessionrecord_after_delete_account',
    table: Table.SESSIONRECORD
  },
  SIGNEDPREKEYRECORD_AFTER_DELETE_ACCOUNT: {
    name: 'signedprekeyrecord_after_delete_account',
    table: Table.SIGNEDPREKEYRECORD
  }
};

const createTriggersAfterDeleteAccount = async trx => {
  const triggerList = Object.values(TRIGERS);
  for (const trigger of triggerList) {
    await trx.raw(`
      CREATE TRIGGER IF NOT EXISTS ${trigger.name}
      AFTER DELETE ON ${Table.ACCOUNT}
      BEGIN
        DELETE FROM ${trigger.table}
        WHERE ${trigger.table}.accountId = OLD.id;
      END;
  `);
  }
};

const dropTriggerAfterDeleteEmail = async knex => {
  const triggerList = Object.values(TRIGERS);
  for (const trigger of triggerList) {
    await knex.raw(`DROP TRIGGER IF EXISTS ${trigger.name};`);
  }
};

/*   Exports
----------------------*/
exports.up = async knex => {
  return await knex.transaction(async trx => {
    await updateAccountTable(trx);
    const currentAccount = await trx
      .select('id')
      .from(Table.ACCOUNT)
      .first();
    const accountId = currentAccount ? currentAccount.id : null;
    await createAccountContactTable(trx, accountId);
    await addAccountIdToEmailTable(trx, accountId);
    await addAccountIdToLabelTable(trx, accountId);
    await updateEmailLabelTable(trx);
    await addAccountIdToPendingEventTable(trx, accountId);
    await addAccountIdToIdentityKeyRecordTable(trx, accountId);
    await addAccountIdToPreKeyRecordTable(trx, accountId);
    await addAccountIdToSessionRecordTable(trx, accountId);
    await addAccountIdToSignedPreKeyRecordTable(trx, accountId);

    await createTriggersAfterDeleteAccount(trx);
  });
};

// On Rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([
    rollbackAccountTable(knex),
    rollbackAccountContactTable(knex),
    rollbackEmailTable(knex),
    rollbackLabelTable(knex),
    rollbackEmailLabelTable(knex),
    rollbackPendingEventTable(knex),
    rollbackIdentityKeyRecordTable(knex),
    rollbackPreKeyRecordTable(knex),
    rollbackSessionRecordTable(knex),
    rollbackSignedPreKeyRecordTable(knex),

    dropTriggerAfterDeleteEmail(knex)
  ]);
};
