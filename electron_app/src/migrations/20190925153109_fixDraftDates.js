const moment = require('moment');
const { Table } = require('../models');
const emailDateFormat = 'YYYY-MM-DD HH:mm:ss';

const parseDateToQuery = date => {
  return date ? `"${moment(date).format(emailDateFormat)}"` : date;
};

const fixDraftDates = async knex => {
  const limit = 100;
  let emailsToUpdate = [];
  const LABELID_TO_FIX = 6;
  await knex.transaction(async trx => {
    do {
      emailsToUpdate = await trx.raw(
        `SELECT ${Table.EMAIL}.* 
         FROM ${Table.EMAIL} 
         JOIN ${Table.EMAIL_LABEL} 
         ON ${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId 
         WHERE ${Table.EMAIL_LABEL}.labelId = ${LABELID_TO_FIX} 
         AND ${Table.EMAIL}.isMuted = 0 
         LIMIT ${limit}`
      );
      await Promise.all(
        emailsToUpdate.map(async email => {
          await trx.raw(`
          UPDATE 
            ${Table.EMAIL} 
          SET 
            isMuted = 1,
            date = ${parseDateToQuery(email.date)}, 
            trashDate = ${parseDateToQuery(email.trashDate)},
            unsendDate = ${parseDateToQuery(email.unsendDate)}
          WHERE 
            ${Table.EMAIL}.id = ${email.id}
        `);
        })
      );
    } while (emailsToUpdate.length > 0);
  });
};

exports.up = async (knex, Promise) => {
  const fixDates = fixDraftDates(knex);
  return await Promise.all([fixDates]);
};

exports.down = (knex, Promise) => {
  return Promise.resolve(true);
};
