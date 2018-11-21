const { Table } = require('./../models');
const { emailRegex } = require('./../utils/RegexUtils');

const getAndFixContacts = async knex => {
  return await knex.transaction(async trx => {
    const namelessContacts = await trx(Table.CONTACT).whereNull('name');

    for (const contact of namelessContacts) {
      const contactEmailIsValid = contact.email.match(emailRegex);

      if (!contactEmailIsValid) {
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

        if (fixedName && fixedEmail) {
          await trx(Table.CONTACT)
            .where({ id: contact.id })
            .update({
              name: fixedName,
              email: fixedEmail
            })
            .catch(async updateErr => {
              if (updateErr.code === 'SQLITE_CONSTRAINT') {
                const [previousDuplicatedContact] = await trx(
                  Table.CONTACT
                ).where({
                  email: fixedEmail
                });

                await trx(Table.EMAIL_CONTACT)
                  .where({ contactId: contact.id })
                  .update({
                    contactId: previousDuplicatedContact.id
                  });

                await trx(Table.CONTACT)
                  .where({ id: contact.id })
                  .del();

                await trx(Table.CONTACT)
                  .where({ email: fixedEmail })
                  .update({
                    email: fixedEmail.toLowerCase()
                  });
              }
            });
        }
      }
    }
  });
};

exports.up = async (knex, Promise) => {
  return await Promise.all([getAndFixContacts(knex)]);
};

exports.down = (knex, Promise) => {
  return Promise.resolve(true);
};
