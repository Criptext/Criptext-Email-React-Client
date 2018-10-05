const { Table } = require('./../models');

const labelIdToFix = 4;

const checkSystemLabelsFixed = async knex => {
  const [lastSystemLabel] = await knex
    .select(`id`)
    .max('id')
    .from(Table.LABEL)
    .where('type', 'system');
  return lastSystemLabel.id === 6;
};

const fixLabels = async knex => {
  const shouldFixLabels = await checkSystemLabelsFixed(knex);
  if (shouldFixLabels) {
    return knex.transaction(async trx => {
      const add = await incrementSystemLabels(trx);
      await incrementEmailLabels(trx, add);
      return await updateColorColumn(trx);
    });
  }
};

const incrementSystemLabels = async trx => {
  const [lastLabel] = await trx
    .select('id')
    .max('id')
    .table(Table.LABEL);
  const nextLabelId = lastLabel.id;
  await trx
    .table(Table.LABEL)
    .where('id', '>', labelIdToFix - 1)
    .increment('id', nextLabelId);
  await trx
    .table(Table.LABEL)
    .where('id', '>', labelIdToFix - 1)
    .decrement('id', nextLabelId - 1);
  return nextLabelId;
};

const updateColorColumn = async trx => {
  const allLabels = await trx.select('*').from(Table.LABEL);
  return await Promise.all(
    allLabels.map(async label => {
      return await trx
        .table(Table.LABEL)
        .update({
          color: label.color[0] === '#' ? label.color.slice(1) : label.color
        })
        .where({ id: label.id });
    })
  );
};

const incrementEmailLabels = async (trx, add) => {
  await trx
    .table(Table.EMAIL_LABEL)
    .where('labelId', '>', labelIdToFix - 1)
    .increment('labelId', add);
  return await trx
    .table(Table.EMAIL_LABEL)
    .where('labelId', '>', labelIdToFix - 1)
    .decrement('labelId', add - 1);
};

const onRollbackMigration = knex => {
  return knex.transaction(async trx => {
    await trx
      .table(Table.LABEL)
      .where('id', '>', labelIdToFix - 1)
      .decrement('id', 1);
    await trx
      .table(Table.EMAIL_LABEL)
      .where('labelId', '>', labelIdToFix - 1)
      .decrement('labelId', 1);
    const allLabels = await trx.select('*').from(Table.LABEL);
    return await Promise.all(
      allLabels.map(async label => {
        return await trx
          .table(Table.LABEL)
          .update({
            color: `#${label.color}`
          })
          .where({ id: label.id });
      })
    );
  });
};

exports.up = async (knex, Promise) => {
  return await Promise.all([fixLabels(knex)]);
};

// On Rollback
exports.down = async (knex, Promise) => {
  return await Promise.all([onRollbackMigration(knex)]);
};
