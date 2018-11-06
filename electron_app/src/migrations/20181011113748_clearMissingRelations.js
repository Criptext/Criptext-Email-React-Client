const { Table } = require('./../models');

const clearMissingEmailLabelRelations = async knex => {
  return await knex
    .table(Table.EMAIL_LABEL)
    .whereRaw(
      `${Table.EMAIL_LABEL}.emailId NOT IN (
      SELECT ${Table.EMAIL}.id
      FROM ${Table.EMAIL}
    )`
    )
    .del();
};

const clearMissingEmailContactRelations = async knex => {
  return await knex
    .table(Table.EMAIL_CONTACT)
    .whereRaw(
      `${Table.EMAIL_CONTACT}.emailId NOT IN (
      SELECT ${Table.EMAIL}.id
      FROM ${Table.EMAIL}
    )`
    )
    .del();
};

const clearMissingFileRelations = async knex => {
  return await knex
    .table(Table.FILE)
    .whereRaw(
      `${Table.FILE}.emailId NOT IN (
      SELECT ${Table.EMAIL}.id
      FROM ${Table.EMAIL}
    )`
    )
    .del();
};

const clearMissingFileKeyRelations = async knex => {
  return await knex
    .table(Table.FILE_KEY)
    .whereRaw(
      `${Table.FILE_KEY}.emailId NOT IN (
      SELECT ${Table.EMAIL}.id
      FROM ${Table.EMAIL}
    )`
    )
    .del();
};

const clearMissingFeedItemRelations = async knex => {
  return await knex
    .table(Table.FEEDITEM)
    .whereRaw(
      `${Table.FEEDITEM}.emailId NOT IN (
      SELECT ${Table.EMAIL}.id
      FROM ${Table.EMAIL}
    )`
    )
    .del();
};

exports.up = async (knex, Promise) => {
  return await Promise.all([
    clearMissingEmailLabelRelations(knex),
    clearMissingEmailContactRelations(knex),
    clearMissingFileRelations(knex),
    clearMissingFileKeyRelations(knex),
    clearMissingFeedItemRelations(knex)
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.resolve(true);
};
