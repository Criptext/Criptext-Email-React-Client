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

/*   Account Contact table
------------------------------*/
const createAccountContactTable = async trx => {
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

  const accountValue = await trx
    .select('id')
    .from(Table.ACCOUNT)
    .first();
  if (!accountValue) return;

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
        accountId: accountValue.id,
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
const addAccountIdToEmailTable = async trx => {
  const accountValue = await trx
    .select('id')
    .from(Table.ACCOUNT)
    .first();
  if (!accountValue) return;

  return trx.schema
    .table(Table.EMAIL, table => {
      table.string('accountId', XSMALL_STRING_SIZE);
    })
    .then(() => {
      return trx.raw(`
        UPDATE ${Table.EMAIL}
        SET accountId = ${accountValue.id};
      `);
    });
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
const addAccountIdToLabelTable = async trx => {
  const accountValue = await trx
    .select('id')
    .from(Table.ACCOUNT)
    .first();
  if (!accountValue) return;

  return trx.schema
    .table(Table.LABEL, table => {
      table.string('accountId', XSMALL_STRING_SIZE);
    })
    .then(async () => {
      await trx
        .table(Table.LABEL)
        .where({ type: 'system' })
        .update({ accountId: null });
      return trx
        .table(Table.LABEL)
        .where({ type: 'custom' })
        .update({ accountId: accountValue.id });
    });
};

const rollbackLabelTable = async knex => {
  const columnExists = await knex.schema.hasColumn(Table.LABEL, 'accountId');
  if (!columnExists) return;
  return knex.schema.table(Table.LABEL, table => {
    table.dropColumn('accountId');
  });
};

/*   Pending event
----------------------*/
const addAccountIdToPendingEventTable = async trx => {
  const accountValue = await trx
    .select('id')
    .from(Table.ACCOUNT)
    .first();
  if (!accountValue) return;

  return trx.schema
    .table(Table.PENDINGEVENT, table => {
      table.string('accountId', XSMALL_STRING_SIZE);
    })
    .then(() => {
      return trx.raw(`
        UPDATE ${Table.PENDINGEVENT}
        SET accountId = ${accountValue.id};
      `);
    });
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
const addAccountIdToIdentityKeyRecordTable = async trx => {
  const accountValue = await trx
    .select('id')
    .from(Table.ACCOUNT)
    .first();
  if (!accountValue) return;

  return trx.schema
    .table(Table.IDENTITYKEYRECORD, table => {
      table.string('accountId', XSMALL_STRING_SIZE);
    })
    .then(() => {
      return trx.raw(`
        UPDATE ${Table.IDENTITYKEYRECORD}
        SET accountId = ${accountValue.id};
      `);
    });
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
const addAccountIdToPreKeyRecordTable = async trx => {
  const accountValue = await trx
    .select('id')
    .from(Table.ACCOUNT)
    .first();
  if (!accountValue) return;

  return trx.schema
    .table(Table.PREKEYRECORD, table => {
      table.string('accountId', XSMALL_STRING_SIZE);
    })
    .then(() => {
      return trx.raw(`
        UPDATE ${Table.PREKEYRECORD}
        SET accountId = ${accountValue.id};
      `);
    });
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

/*   Exports
----------------------*/
exports.up = async knex => {
  return await knex.transaction(async trx => {
    await updateAccountTable(trx);
    await createAccountContactTable(trx);
    await addAccountIdToEmailTable(trx);
    await addAccountIdToLabelTable(trx);
    await addAccountIdToPendingEventTable(trx);
    await addAccountIdToIdentityKeyRecordTable(trx);
    await addAccountIdToPreKeyRecordTable(trx);
  });
};

// On Rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([
    rollbackAccountTable(knex),
    rollbackAccountContactTable(knex),
    rollbackEmailTable(knex),
    rollbackLabelTable(knex),
    rollbackPendingEventTable(knex),
    rollbackIdentityKeyRecordTable(knex),
    rollbackPreKeyRecordTable(knex)
  ]);
};
