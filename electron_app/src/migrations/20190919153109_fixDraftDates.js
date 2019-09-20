const moment = require('moment');
const { Table } = require('./../models');
const emailDateFormat = 'YYYY-MM-DD HH:mm:ss';

const parseDate = date => moment(date).format(emailDateFormat);

const fixDraftDates = async knex => {
  let emailsToUpdate = [];
  const limit = 100;
  let minId = 1;
  let maxId = minId + limit;
  const LABELID_TO_FIX = 6;
  await knex.transaction(async trx => {
    do {
      emailsToUpdate = await trx.raw(`
        SELECT ${Table.EMAIL}.* 
        FROM ${Table.EMAIL} 
        JOIN 
          ${Table.EMAIL_LABEL} on ${Table.EMAIL}.id = ${
        Table.EMAIL_LABEL
      }.emailId 
        WHERE 
          ${Table.EMAIL_LABEL}.labelId = ${LABELID_TO_FIX} 
          AND ${Table.EMAIL}.id > ${minId} 
          AND ${Table.EMAIL}.id < ${maxId}
      `);
      await Promise.all(
        emailsToUpdate.map(async email => {
          await trx.raw(`
          UPDATE 
            ${Table.EMAIL} 
          SET 
            date = "${parseDate(email.date)}", 
            trashDate = ${
              email.trashDate
                ? `"` + parseDate(email.trashDate) + `"`
                : email.trashDate
            },
            unsendDate = ${
              email.unsendDate
                ? `"` + parseDate(email.unsendDate) + `"`
                : email.unsendDate
            }
          WHERE 
            ${Table.EMAIL}.id = ${email.id}
        `);
        })
      );
      minId += limit;
      maxId += limit;
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
