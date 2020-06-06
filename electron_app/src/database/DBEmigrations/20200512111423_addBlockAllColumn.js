'use strict';
const { Table } = require('../DBEmodel');

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

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await migrateBlockRemoteContent(queryInterface, Sequelize, transaction);
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
