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
