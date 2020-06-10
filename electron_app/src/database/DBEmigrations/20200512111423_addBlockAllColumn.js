'use strict';
const { Table, Email } = require('../DBEmodel');

const migrateBlockRemoteContent = async (
  queryInterface,
  Sequelize,
  transaction
) => {
  const accountDef = await queryInterface.describeTable(Table.ACCOUNT, {
    transaction
  });

  if (accountDef.blockRemoteContent === undefined) {
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'blockRemoteContent',
      { type: Sequelize.BOOLEAN, defaultValue: true },
      { transaction }
    );
  }
};

const rollbackBlockRemoteContent = async (queryInterface, transaction) => {
  const accountDef = await queryInterface.describeTable(Table.ACCOUNT, {
    transaction
  });

  if (accountDef.blockRemoteContent !== undefined) {
    await queryInterface.removeColumn(Table.ACCOUNT, 'blockRemoteContent', {
      transaction
    });
  }
};

const handleDuplicatedMessageIds = async (queryInterface, transaction) => {
  const query = `SELECT key, messageId, COUNT(*), GROUP_CONCAT(id) as 'ids' FROM ${
    Table.EMAIL
  } GROUP BY messageId HAVING COUNT(*) > 1 `;
  const [results] = await queryInterface.sequelize.query(query, {
    transaction
  });
  const idsToDelete = [];
  results.forEach(row => {
    const ids = row.ids.split(',');
    ids.shift();
    idsToDelete.push(ids);
  });
  await Email().destroy({
    where: {
      id: idsToDelete
    },
    transaction
  });
};

const addUniqueIndexes = async (queryInterface, transaction) => {
  await queryInterface.sequelize.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${Table.EMAIL}_message_id_unique ON ${
      Table.EMAIL
    } (messageId, accountId)`,
    { transaction }
  );

  await queryInterface.sequelize.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${Table.EMAIL}_key_unique ON ${
      Table.EMAIL
    } (key, accountId)`,
    { transaction }
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await migrateBlockRemoteContent(queryInterface, Sequelize, transaction);
      await handleDuplicatedMessageIds(queryInterface, transaction);
      await addUniqueIndexes(queryInterface, transaction);
      await transaction.commit();
    } catch (ex) {
      console.error(ex);
      await transaction.rollback();
      throw new Error(ex.toString());
    }
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await rollbackBlockRemoteContent(queryInterface, transaction);
      await transaction.commit();
    } catch (ex) {
      await transaction.rollback();
      throw new Error(ex.toString());
    }
  }
};
