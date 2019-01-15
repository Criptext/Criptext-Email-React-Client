const { Table } = require('./../models');
const { genUUID } = require('./../utils/stringUtils');

const genSystemLabelUUID = id => {
  return `00000000-0000-0000-0000-00000000000${id}`;
};

const createUUIDColumn = async knex => {
  await knex.schema.table(Table.LABEL, table => {
    table.uuid('uuid').unique();
  });
  return await updateUUIDForExistingCustomLabel(knex);
};
const updateUUIDForExistingCustomLabel = async knex => {
  let shouldGetMoreLabels = true;
  const batch = 50;
  let minId = 0,
    maxId = batch;

  while (shouldGetMoreLabels) {
    const labels = await knex
      .select('*')
      .from(Table.LABEL)
      .whereBetween('id', [minId, maxId]);
    if (!labels.length) {
      shouldGetMoreLabels = false;
      break;
    }

    for (const label of labels) {
      if (!label.uuid) {
        const uuid =
          label.type === 'system' ? genSystemLabelUUID(label.id) : genUUID();
        await knex
          .table(Table.LABEL)
          .where({
            id: label.id
          })
          .update({ uuid });
      }
    }
    minId += batch;
    maxId += batch;
  }
};
const deleteUUIDColumn = knex => {
  return knex.schema.table(Table.LABEL, table => {
    table.dropColumn('uuid');
  });
};

const createIsTrustedColumn = knex => {
  return knex.schema.table(Table.CONTACT, table => {
    table.boolean('isTrusted').defaultTo(false);
  });
};
const deleteIsTrustedColumn = knex => {
  return knex.schema.table(Table.CONTACT, table => {
    table.dropColumn('isTrusted');
  });
};

exports.up = async (knex, Promise) => {
  const checkAndCreateUUIDColumn = knex.schema
    .hasColumn(Table.LABEL, 'uuid')
    .then(columnExists => {
      return !columnExists && createUUIDColumn(knex);
    });

  const checkAndCreateIstrustedColumn = knex.schema
    .hasColumn(Table.CONTACT, 'isTrusted')
    .then(columnExists => {
      return !columnExists && createIsTrustedColumn(knex);
    });

  return await Promise.all([
    checkAndCreateUUIDColumn,
    checkAndCreateIstrustedColumn
  ]);
};

// On rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([
    deleteUUIDColumn(knex),
    deleteIsTrustedColumn(knex)
  ]);
};
