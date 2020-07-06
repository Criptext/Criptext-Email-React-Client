'use strict';
const { Table } = require('../DBEmodel');

const migrateAccount = async (queryInterface, Sequelize, transaction) => {
  const accountDef = await queryInterface.describeTable(Table.ACCOUNT, {
    transaction
  });

  if (accountDef.defaultAddressId === undefined) {
    await queryInterface.addColumn(
      Table.ACCOUNT,
      'defaultAddressId',
      { type: Sequelize.INTEGER, allowNull: true },
      { transaction }
    );
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await migrateAccount(queryInterface, Sequelize, transaction);
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
      await rollbackAccount(queryInterface, transaction);
      await transaction.commit();
    } catch (ex) {
      await transaction.rollback();
      throw new Error(ex.toString());
    }
  }
};

const rollbackAccount = async (queryInterface, transaction) => {
  const accountDef = await queryInterface.describeTable(Table.ACCOUNT, {
    transaction
  });

  if (accountDef.defaultAddressId !== undefined) {
    await queryInterface.removeColumn(Table.ACCOUNT, 'defaultAddressId', {
      transaction
    });
  }
};
