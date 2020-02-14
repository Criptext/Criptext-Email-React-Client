'use strict';
const { Table, AccountContact } = require('../DBEmodel');

const TABLE_ACCOUNT_ID_INDEX = '_accountid_index';
const tables = [
  Table.EMAIL,
  Table.LABEL,
  Table.IDENTITYKEYRECORD,
  Table.PREKEYRECORD,
  Table.PENDINGEVENT,
  Table.SESSIONRECORD,
  Table.SIGNEDPREKEYRECORD,
  Table.FEEDITEM
];

const tablesNeedId = [
  Table.IDENTITYKEYRECORD,
  Table.PREKEYRECORD,
  Table.SESSIONRECORD,
  Table.SIGNEDPREKEYRECORD
];

const migrateAccountSettings = async (
  queryInterface,
  Sequelize,
  transaction
) => {
  const accountDef = await queryInterface.describeTable(Table.ACCOUNT);

  if (accountDef.autoBackupEnable === undefined) {
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'autoBackupEnable',
      { type: Sequelize.BOOLEAN, defaultValue: false },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'autoBackupFrequency',
      { type: Sequelize.STRING },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'autoBackupLastDate',
      { type: Sequelize.DATE },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'autoBackupLastSize',
      { type: Sequelize.INTEGER },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'autoBackupNextDate',
      { type: Sequelize.DATE },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'autoBackupPath',
      { type: Sequelize.STRING },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'domain',
      { type: Sequelize.STRING },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'isActive',
      { type: Sequelize.BOOLEAN, defaultValue: true },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'isLoggedIn',
      { type: Sequelize.BOOLEAN, defaultValue: true },
      { transaction }
    );
  }

  const settingsDef = await queryInterface.describeTable(Table.SETTINGS);

  if (settingsDef.autoBackupEnable !== undefined) {
    const [[settings]] = await queryInterface.sequelize.query(
      `select autoBackupEnable, autoBackupFrequency, autoBackupLastDate, autoBackupLastSize, autoBackupNextDate, autoBackupPath from ${
        Table.SETTINGS
      }`,
      { transaction }
    );

    const [[account]] = await queryInterface.sequelize.query(
      `select deviceId, recipientId, isActive from ${Table.ACCOUNT}`,
      { transaction }
    );
    if (account && account.deviceId) {
      queryInterface.sequelize.query(
        `update ${
          Table.ACCOUNT
        } set isActive=true, isLoggedIn=true where recipientId='${
          account.recipientId
        }'`,
        { transaction }
      );
    }

    if (settings && settings.autoBackupEnable && account) {
      queryInterface.sequelize.query(
        `update ${Table.ACCOUNT} set autoBackupEnable=${
          settings.autoBackupEnable
        }, autoBackupFrequency='${
          settings.autoBackupFrequency
        }', autoBackupLastSize='${
          settings.autoBackupLastSize
        }', autoBackupNextDate='${
          settings.autoBackupNextDate
        }', autoBackupPath='${settings.autoBackupPath}', autoBackupLastDate='${
          settings.autoBackupLastDate
        }' where recipientId='${account.recipientId}'`,
        { transaction }
      );
    }

    await queryInterface.removeColumn(Table.SETTINGS, 'autoBackupEnable', {
      transaction
    });
    await queryInterface.removeColumn(Table.SETTINGS, 'autoBackupFrequency', {
      transaction
    });
    await queryInterface.removeColumn(Table.SETTINGS, 'autoBackupLastDate', {
      transaction
    });
    await queryInterface.removeColumn(Table.SETTINGS, 'autoBackupLastSize', {
      transaction
    });
    await queryInterface.removeColumn(Table.SETTINGS, 'autoBackupNextDate', {
      transaction
    });
    await queryInterface.removeColumn(Table.SETTINGS, 'autoBackupPath', {
      transaction
    });
  }
};

const addAccountIdToTables = async (queryInterface, Sequelize, transaction) => {
  let table;
  for (table of tables) {
    const tableDef = await queryInterface.describeTable(table);
    if (tableDef['accountId']) continue;
    await queryInterface.addColumn(
      table,
      'accountId',
      {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: Table.ACCOUNT,
          key: 'id'
        }
      },
      { transaction }
    );
    await queryInterface.addIndex(
      table,
      {
        fields: ['accountId'],
        unique: false,
        transaction,
        name: `${table}${TABLE_ACCOUNT_ID_INDEX}`
      },
      { transaction }
    );
  }
};

const addIdToTables = async (queryInterface, Sequelize, transaction) => {
  let table;
  for (table of tablesNeedId) {
    const tableDef = await queryInterface.describeTable(table);
    if (tableDef.id !== undefined) continue;

    const backupTable = `${table}_backup`;

    switch (table) {
      case Table.SESSIONRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('id' INTEGER PRIMARY KEY, 'recipientId' VARCHAR(255), 'deviceId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (recipientId, deviceId, record, recordLength, accountId) SELECT * FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('id' INTEGER PRIMARY KEY, 'recipientId' VARCHAR(255), 'deviceId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
      case Table.PREKEYRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('id' INTEGER PRIMARY KEY, 'preKeyId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (preKeyId, record, recordLength, accountId) SELECT * FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('id' INTEGER PRIMARY KEY, 'preKeyId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
      case Table.SIGNEDPREKEYRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('id' INTEGER PRIMARY KEY, 'signedPreKeyId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (signedPreKeyId, record, recordLength, accountId) SELECT * FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('id' INTEGER PRIMARY KEY, 'signedPreKeyId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
      case Table.IDENTITYKEYRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('id' INTEGER PRIMARY KEY, 'recipientId' VARCHAR(255), 'deviceId' INTEGER, 'identityKey' VARCHAR(255), 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (recipientId, deviceId, identityKey, accountId) SELECT * FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('id' INTEGER PRIMARY KEY, 'recipientId' VARCHAR(255), 'deviceId' INTEGER, 'identityKey' VARCHAR(255), 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
    }
  }
};

const FillAccountContacts = async (queryInterface, transaction) => {
  const [[account]] = await queryInterface.sequelize.query(
    `select id from ${Table.ACCOUNT}`,
    { transaction }
  );

  if (!account) return;

  const [contacts] = await queryInterface.sequelize.query(
    `select id from ${Table.CONTACT}`,
    { transaction }
  );

  const contactAccountsToInsert = contacts.map(contact => {
    return {
      accountId: account.id,
      contactId: contact.id
    };
  });
  await AccountContact().bulkCreate(contactAccountsToInsert, { transaction });
};

const fillAccountIdToTables = async (queryInterface, transaction) => {
  const [[account]] = await queryInterface.sequelize.query(
    `select id from ${Table.ACCOUNT}`,
    { transaction }
  );

  if (!account) return;

  let table;
  for (table of tables) {
    if (table === Table.LABEL) {
      await queryInterface.sequelize.query(
        `update ${table} set accountId='${account.id}' where type='custom';`,
        { transaction }
      );
      return;
    }
    await queryInterface.sequelize.query(
      `update ${table} set accountId='${account.id}';`,
      { transaction }
    );
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await migrateAccountSettings(queryInterface, Sequelize, transaction);
      await addAccountIdToTables(queryInterface, Sequelize, transaction);
      await FillAccountContacts(queryInterface, transaction);
      await addIdToTables(queryInterface, Sequelize, transaction);

      const [[account]] = await queryInterface.sequelize.query(
        `select recipientId from ${Table.ACCOUNT}`,
        { transaction }
      );

      if (!account) {
        await transaction.commit();
        return;
      }

      await fillAccountIdToTables(queryInterface, transaction);

      await transaction.commit();
    } catch (ex) {
      console.log(ex);
      await transaction.rollback();
      throw new Error(ex.toString());
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await removeAccountIdColumns(queryInterface, transaction);
      await queryInterface.dropTable(Table.AccountContact, { transaction });
      await rollbackAccountSettings(queryInterface, Sequelize, transaction);
      await removeIdFromTables(queryInterface, transaction);

      await transaction.commit();
    } catch (ex) {
      await transaction.rollback();
      throw new Error(ex.toString());
    }
  }
};

const removeAccountIdColumns = async (queryInterface, transaction) => {
  let table;
  for (table of tables) {
    await queryInterface.removeIndex(
      table,
      `${table}${TABLE_ACCOUNT_ID_INDEX}`,
      transaction
    );
    await queryInterface.removeColumn(Table.EMAIL, 'accountId', {
      transaction
    });
  }
};

const removeIdFromTables = async (queryInterface, transaction) => {
  let table;
  for (table of tablesNeedId) {
    const tableDef = await queryInterface.describeTable(table);
    if (tableDef.id === undefined) continue;

    const backupTable = `${table}_backup`;

    switch (table) {
      case Table.SESSIONRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('recipientId' VARCHAR(255), 'deviceId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER, PRIMARY KEY (recipientId, deviceId));`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (recipientId, deviceId, record, recordLength, accountId) SELECT recipientId, deviceId, record, recordLength, accountId FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('recipientId' VARCHAR(255), 'deviceId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER, PRIMARY KEY (recipientId, deviceId));`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
      case Table.PREKEYRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('preKeyId' INTEGER PRIMARY KEY, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (preKeyId, record, recordLength, accountId) SELECT preKeyId, record, recordLength, accountId FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('preKeyId' INTEGER, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
      case Table.SIGNEDPREKEYRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('signedPreKeyId' INTEGER PRIMARY KEY, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (signedPreKeyId, record, recordLength, accountId) SELECT signedPreKeyId, record, recordLength, accountId FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('signedPreKeyId' INTEGER PRIMARY KEY, 'record' VARCHAR(255), 'recordLength' INTEGER, 'accountId' INTEGER);`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
      case Table.IDENTITYKEYRECORD:
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${backupTable}' ('recipientId' VARCHAR(255), 'deviceId' INTEGER, 'identityKey' VARCHAR(255), 'accountId' INTEGER, PRIMARY KEY (recipientId, deviceId));`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${backupTable}' (recipientId, deviceId, identityKey, accountId) SELECT recipientId, deviceId, identityKey, accountId FROM '${table}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${table}`, {
          transaction
        });
        queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS '${table}' ('recipientId' VARCHAR(255), 'deviceId' INTEGER, 'identityKey' VARCHAR(255), 'accountId' INTEGER, PRIMARY KEY (recipientId, deviceId));`,
          { transaction }
        );
        queryInterface.sequelize.query(
          `INSERT INTO '${table}' SELECT * FROM '${backupTable}'`,
          { transaction }
        );
        await queryInterface.sequelize.query(`DROP TABLE ${backupTable}`, {
          transaction
        });
        break;
    }
  }
};

const rollbackAccountSettings = async (
  queryInterface,
  Sequelize,
  transaction
) => {
  const settingsDef = await queryInterface.describeTable(Table.ACCOUNT);

  if (settingsDef.autoBackupEnable === undefined) {
    await queryInterface.addColumn(
      Table.SETTINGS,
      'autoBackupEnable',
      { type: Sequelize.BOOLEAN, defaultValue: false },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.SETTINGS,
      'autoBackupFrequency',
      { type: Sequelize.STRING },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.SETTINGS,
      'autoBackupLastDate',
      { type: Sequelize.DATE },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.SETTINGS,
      'autoBackupLastSize',
      { type: Sequelize.INTEGER },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.SETTINGS,
      'autoBackupNextDate',
      { type: Sequelize.DATE },
      { transaction }
    );
    await queryInterface.addColumn(
      Table.SETTINGS,
      'autoBackupPath',
      { type: Sequelize.STRING },
      { transaction }
    );
  }

  const [[account]] = await queryInterface.sequelize.query(
    `select autoBackupEnable, autoBackupFrequency, autoBackupLastDate, autoBackupLastSize, autoBackupNextDate, autoBackupPath from ${
      Table.ACCOUNT
    }`,
    { transaction }
  );

  const [[settings]] = await queryInterface.sequelize.query(
    `select id from ${Table.SETTINGS}`,
    { transaction }
  );

  if (account && account.autoBackupEnable && settings) {
    queryInterface.sequelize.query(
      `update ${Table.SETTINGS} set autoBackupEnable=${
        account.autoBackupEnable
      }, autoBackupFrequency='${
        account.autoBackupFrequency
      }', autoBackupLastSize='${
        account.autoBackupLastSize
      }', autoBackupNextDate='${account.autoBackupNextDate}', autoBackupPath='${
        account.autoBackupPath
      }', autoBackupLastDate='${account.autoBackupLastDate}' where id=${
        settings.id
      }`
    );
  }

  const accountDef = await queryInterface.describeTable(Table.ACCOUNT);

  if (accountDef.autoBackupEnable !== undefined) {
    await queryInterface.removeColumn(Table.ACCOUNT, 'autoBackupEnable', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'autoBackupFrequency', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'autoBackupLastDate', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'autoBackupLastSize', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'autoBackupNextDate', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'autoBackupPath', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'domain', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'isActive', {
      transaction
    });
    await queryInterface.removeColumn(Table.ACCOUNT, 'isLoggedIn', {
      transaction
    });
  }
};
