'use strict';
const { Table } = require('../DBEmodel');
const logger = require('../../logger');

const migrateEmailTable = async (queryInterface, Sequelize, transaction) => {
  const emailDef = await queryInterface.describeTable(Table.EMAIL, {
    transaction
  });

  if (emailDef.isNewsletter === undefined) {
    await queryInterface.addColumn(
      Table.EMAIL,
      'isNewsletter',
      { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: null },
      { transaction }
    );
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await migrateEmailTable(queryInterface, Sequelize, transaction);
      await transaction.commit();
    } catch (ex) {
      logger.error({
        message: 'Migration Email Is Newsletter',
        error: ex
      });
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
  const emailDef = await queryInterface.describeTable(Table.EMAIL, {
    transaction
  });

  if (emailDef.isNewsletter !== undefined) {
    await queryInterface.removeColumn(Table.EMAIL, 'isNewsletter', {
      transaction
    });
  }
};
