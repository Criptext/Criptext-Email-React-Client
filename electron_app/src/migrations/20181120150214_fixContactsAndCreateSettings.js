const { Table } = require('./../database/models');
const { emailRegex } = require('../utils/RegexUtils');

const getAndFixContacts = async knex => {
  return await knex.transaction(async trx => {
    const namelessContacts = await trx(Table.CONTACT).whereNull('name');
    for (const contact of namelessContacts) {
      const contactEmailIsValid = contact.email.match(emailRegex);

      if (contactEmailIsValid) {
        continue;
      }

      let fixedEmail = '';
      let fixedName = '';
      const contactEmailParts = contact.email.split(' ');
      const lastPart = contactEmailParts[contactEmailParts.length - 1];
      if (lastPart.match(emailRegex)) {
        fixedEmail = lastPart;
        fixedName = contactEmailParts
          .slice(0, contactEmailParts.length - 1)
          .join(' ');
      }

      if (!fixedName || !fixedEmail) {
        continue;
      }

      await trx(Table.CONTACT)
        .where({ id: contact.id })
        .update({
          name: fixedName,
          email: fixedEmail
        })
        .catch(async updateErr => {
          if (!updateErr.code === 'SQLITE_CONSTRAINT') {
            return;
          }

          const previousDuplicatedContact = await trx
            .select('*')
            .from(Table.CONTACT)
            .where('email', 'like', `${fixedEmail}`);
          const duplicatedContactIds = previousDuplicatedContact.map(contact =>
            Number(contact.id)
          );
          duplicatedContactIds.push(contact.id);
          duplicatedContactIds.sort((a, b) => a - b);

          if (duplicatedContactIds.length) {
            const [firstId, ...anotherContactIds] = duplicatedContactIds;
            await trx(Table.EMAIL_CONTACT)
              .whereIn('contactId', duplicatedContactIds)
              .update({
                contactId: firstId
              });
            await trx(Table.CONTACT)
              .whereIn('id', anotherContactIds)
              .del();
          }
          return await trx(Table.CONTACT)
            .where({ email: fixedEmail })
            .update({
              name: fixedName,
              email: fixedEmail.toLowerCase()
            });
        });
    }
    return await createSettngsTable(trx);
  });
};

const createSettngsTable = async trx => {
  const tableExists = await trx.schema.hasTable(Table.SETTINGS);
  if (!tableExists) {
    await trx.schema.createTable(Table.SETTINGS, table => {
      table.increments('id').primary();
      table
        .string('language')
        .notNullable()
        .defaultTo('en');
      table
        .boolean('opened')
        .notNullable()
        .defaultTo(false);
      table
        .string('theme')
        .notNullable()
        .defaultTo('light');
    });
  }

  let prevOpenedValue = false;
  const hasOpenedColumnInAccount = await trx.schema.hasColumn(
    Table.ACCOUNT,
    'opened'
  );

  if (hasOpenedColumnInAccount) {
    const [{ opened }] = await trx.select('opened').from(Table.ACCOUNT);
    prevOpenedValue = opened;
    await trx.schema.table(Table.ACCOUNT, table => {
      table.dropColumn('opened');
    });
  }

  const [prevSettingsValue] = await trx(Table.SETTINGS).where({ id: 1 });
  if (prevSettingsValue) {
    return;
  }
  return await trx.table(Table.SETTINGS).insert({ opened: prevOpenedValue });
};

exports.up = async (knex, Promise) => {
  return await Promise.all([getAndFixContacts(knex)]);
};

exports.down = (knex, Promise) => {
  return Promise.resolve(true);
};
