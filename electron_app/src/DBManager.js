const {
  db,
  cleanDataBase,
  cleanDataLogout,
  createSignalTables,
  createTables,
  Table
} = require('./models.js');
const { formContactsRow } = require('./utils/dataTableUtils.js');
const { noNulls } = require('./utils/ObjectUtils');
const { HTMLTagsRegex } = require('./utils/RegexUtils');
const myAccount = require('./Account');
const systemLabels = require('./systemLabels');
const mySettings = require('./Settings');
const { setLanguage } = require('./lang');
const { genUUID } = require('./utils/stringUtils');

const EMAIL_CONTACT_TYPE_FROM = 'from';

/* Account
----------------------------- */
const createAccount = params => {
  return db.transaction(async trx => {
    const [accountId] = await trx.table(Table.ACCOUNT).insert(params);
    await defineActiveAccountById(accountId, trx);
    return [accountId];
  });
};

const defineActiveAccountById = async (accountId, prevTrx) => {
  const transaction = prevTrx ? fn => fn(prevTrx) : db.transaction;
  await transaction(async trx => {
    await trx
      .table(Table.ACCOUNT)
      .where({ isActive: true })
      .update({ isActive: false });
    await trx
      .table(Table.ACCOUNT)
      .where('id', accountId)
      .update({ isActive: true });
    const [activeAccount] = await trx
      .table(Table.ACCOUNT)
      .select('*')
      .where({ isActive: true });
    myAccount.initialize(activeAccount);
  });
};

const deleteAccountByParams = params => {
  return db
    .table(Table.ACCOUNT)
    .where(params)
    .del();
};

const getAccount = () => {
  return db
    .table(Table.ACCOUNT)
    .select('*')
    .where({ isActive: true });
};

const getAccountByParams = params => {
  return db
    .table(Table.ACCOUNT)
    .select('*')
    .where(params);
};

const updateAccount = async ({
  deviceId,
  jwt,
  refreshToken,
  name,
  privKey,
  pubKey,
  recipientId,
  registrationId,
  signature,
  signatureEnabled,
  isLoggedIn,
  isActive
}) => {
  const params = noNulls({
    deviceId,
    jwt,
    refreshToken,
    name,
    privKey,
    pubKey,
    registrationId,
    signature,
    signatureEnabled:
      typeof signatureEnabled === 'boolean' ? signatureEnabled : undefined,
    isLoggedIn: typeof isLoggedIn === 'boolean' ? isLoggedIn : undefined,
    isActive: typeof isActive === 'boolean' ? isActive : undefined
  });
  const response = await db
    .table(Table.ACCOUNT)
    .where({ recipientId })
    .update(params);
  myAccount.update(params);
  return response;
};

/* Contact Account
----------------------------- */
const createAccountContact = (params, trx) => {
  const knex = trx || db;
  return knex.table(Table.ACCOUNT_CONTACT).insert(params);
};

const deleteAccountContact = ({ accountId }, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.ACCOUNT_CONTACT)
    .where({ accountId })
    .del();
};

/* Contact
----------------------------- */
const createContact = params => {
  return db.transaction(async trx => {
    const { accountId = myAccount.id } = params;
    let contactId;
    const [existingContact] = await trx
      .select('*')
      .from(Table.CONTACT)
      .where('email', params.email);
    if (!existingContact) {
      const contactData = Object.assign({}, params);
      delete contactData.accountId;
      [contactId] = await trx.table(Table.CONTACT).insert(contactData);
    } else {
      contactId = existingContact.id;
    }
    const [existingContactRelation] = await trx
      .select('*')
      .from(Table.ACCOUNT_CONTACT)
      .where({ contactId, accountId });
    if (!existingContactRelation) {
      await createAccountContact({ contactId, accountId }, trx);
    }
    return contactId;
  });
};

const createContactsIfOrNotStore = async ({ accountId, contacts }, trx) => {
  const parsedContacts = filterUniqueContacts(formContactsRow(contacts));
  const contactsMap = parsedContacts.reduce((contactsObj, contact) => {
    contactsObj[contact.email] = contact;
    return contactsObj;
  }, {});
  const emailAddresses = Object.keys(contactsMap);

  const knex = trx || db;
  const contactsFound = await knex
    .select(`${Table.CONTACT}.*`)
    .from(Table.CONTACT)
    .leftJoin(
      Table.ACCOUNT_CONTACT,
      `${Table.ACCOUNT_CONTACT}.contactId`,
      `${Table.CONTACT}.id`
    )
    .whereIn('email', emailAddresses)
    .andWhere('accountId', accountId);
  const contactsToUpdate = contactsFound.reduce((toUpdateArray, contact) => {
    const email = contact.email;
    const newName = contactsMap[email].name || contact.name;
    if (newName !== contact.name) {
      toUpdateArray.push({ email, name: newName });
    }
    return toUpdateArray;
  }, []);
  const storedEmailAddresses = contactsFound.map(
    storedContact => storedContact.email
  );
  const newContacts = parsedContacts.filter(
    contact => !storedEmailAddresses.includes(contact.email)
  );
  if (newContacts.length) {
    await Promise.all(
      newContacts.map(async contact => {
        const [contactExists] = await knex
          .select('id')
          .from(Table.CONTACT)
          .where('email', contact.email);
        let contactId = undefined;
        if (contactExists) {
          contactId = contactExists.id;
        } else {
          [contactId] = await knex.table(Table.CONTACT).insert(contact);
        }
        await createAccountContact({ contactId, accountId }, knex);
      })
    );
  }
  if (contactsToUpdate.length) {
    await Promise.all(
      contactsToUpdate.map(contact => updateContactByEmail(contact, knex))
    );
  }
  return emailAddresses;
};

const filterUniqueContacts = contacts => {
  const contactsUnique = contacts.reduce(
    (result, contact) => {
      const obj = Object.assign(result);
      if (!result.stack[contact.email]) {
        obj.stack[contact.email] = contact;
        obj.contacts.push(contact);
      }
      return obj;
    },
    { stack: {}, contacts: [] }
  );
  return contactsUnique.contacts;
};

const getAllContacts = accountId => {
  return db
    .select('name', 'email')
    .from(Table.CONTACT)
    .leftJoin(
      Table.ACCOUNT_CONTACT,
      `${Table.ACCOUNT_CONTACT}.contactId`,
      `${Table.CONTACT}.id`
    )
    .where('accountId', accountId)
    .orderBy('score', 'DESC')
    .orderBy('name');
};

const getContactByEmails = ({ accountId, emails }, trx) => {
  const knex = trx || db;
  return knex
    .select(`${Table.CONTACT}.id`, 'email', 'score', 'accountId')
    .from(Table.CONTACT)
    .leftJoin(
      Table.ACCOUNT_CONTACT,
      `${Table.ACCOUNT_CONTACT}.contactId`,
      `${Table.CONTACT}.id`
    )
    .whereIn('email', emails)
    .andWhere('accountId', accountId);
};

const getContactByIds = (ids, trx) => {
  const knex = trx || db;
  return knex
    .select('id', 'email', 'name')
    .from(Table.CONTACT)
    .whereIn('id', ids);
};

const getContactsByEmailId = async emailId => {
  const emailContacts = await db
    .select('contactId', 'type')
    .from(Table.EMAIL_CONTACT)
    .where({ emailId });
  const toContactsId = getContactsIdByType(emailContacts, 'to');
  const ccContactsId = getContactsIdByType(emailContacts, 'cc');
  const bccContactsId = getContactsIdByType(emailContacts, 'bcc');
  const fromContactsId = getContactsIdByType(emailContacts, 'from');

  const to = await getContactByIds(toContactsId);
  const cc = await getContactByIds(ccContactsId);
  const bcc = await getContactByIds(bccContactsId);
  const from = await getContactByIds(fromContactsId);
  return { to, cc, bcc, from };
};

const getContactsIdByType = (emailContacts, type) => {
  return emailContacts
    .filter(item => item.type === type)
    .map(item => item.contactId);
};

const updateContactByEmail = ({ email, name }, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.CONTACT)
    .where({ email })
    .update({ name });
};

const updateContactScore = (emailId, trx) => {
  const subquery = trx
    .table(Table.EMAIL_CONTACT)
    .select('contactId')
    .where('emailId', emailId)
    .andWhere('type', '<>', EMAIL_CONTACT_TYPE_FROM);
  return trx
    .table(Table.CONTACT)
    .whereIn('id', subquery)
    .increment('score', 1);
};

/* EmailContact
----------------------------- */
const createEmailContact = (emailContacts, trx) => {
  return trx.insert(emailContacts).into(Table.EMAIL_CONTACT);
};

const deleteEmailContactByEmailId = (emailId, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.EMAIL_CONTACT)
    .where({ emailId })
    .del();
};

/* EmailLabel
----------------------------- */
const createEmailLabel = (emailLabels, prevTrx) => {
  const transaction = prevTrx ? fn => fn(prevTrx) : db.transaction;
  return transaction(async trx => {
    const toInsert = await filterEmailLabelIfNotStore(emailLabels, trx);
    if (toInsert.length) {
      await filterEmailLabelTrashToUpdateEmail(toInsert, 'create', trx);
      return await trx.insert(toInsert).into(Table.EMAIL_LABEL);
    }
  });
};

const deleteEmailLabel = ({ emailsId, labelIds }, prevTrx) => {
  const emailLabels = emailsId.map(item => {
    return {
      emailId: item,
      labelId: labelIds[0]
    };
  });
  const transaction = prevTrx ? fn => fn(prevTrx) : db.transaction;
  return transaction(async trx => {
    await filterEmailLabelTrashToUpdateEmail(emailLabels, 'delete', trx);
    return await trx
      .table(Table.EMAIL_LABEL)
      .whereIn('labelId', labelIds)
      .whereIn('emailId', emailsId)
      .del();
  });
};

const deleteEmailLabelsByEmailId = (emailId, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.EMAIL_LABEL)
    .where({ emailId })
    .del();
};

const filterEmailLabelIfNotStore = async (emailLabels, trx) => {
  const knex = trx || db;
  const emailIds = Array.from(new Set(emailLabels.map(item => item.emailId)));
  const labelIds = Array.from(new Set(emailLabels.map(item => item.labelId)));
  const stored = await knex
    .select('*')
    .table(Table.EMAIL_LABEL)
    .whereIn('emailId', emailIds)
    .whereIn('labelId', labelIds);

  const storedEmailIds = stored.map(item => item.emailId);
  const storedLabelIds = stored.map(item => String(item.labelId));
  return emailLabels
    .map(item => {
      const isEmailIdStored = storedEmailIds.includes(String(item.emailId));
      const isLabelIdStored = storedLabelIds.includes(String(item.labelId));
      return isEmailIdStored && isLabelIdStored
        ? null
        : { emailId: String(item.emailId), labelId: Number(item.labelId) };
    })
    .filter(item => item !== null);
};

const filterEmailLabelTrashToUpdateEmail = async (emailLabels, action, trx) => {
  const trashDate = action === 'create' ? trx.fn.now() : '';
  const ids = emailLabels
    .filter(emailLabel => emailLabel.labelId === systemLabels.trash.id)
    .map(item => item.emailId);
  if (ids.length) {
    return await updateEmails({ ids, trashDate }, trx);
  }
};

const getEmailLabelsByEmailId = emailId => {
  return db
    .select('labelId')
    .table(Table.EMAIL_LABEL)
    .where({ emailId });
};

/* Email
----------------------------- */
const createEmail = async (params, trx) => {
  const knex = trx || db;
  const { recipients, email, accountId } = params;
  if (!recipients) {
    const emailData = Array.isArray(email)
      ? email.map(noNulls)
      : noNulls(email);
    return knex
      .table(Table.EMAIL)
      .insert(Object.assign({ accountId }, emailData));
  }
  const recipientsFrom = recipients.from || [];
  const recipientsTo = recipients.to || [];
  const recipientsCc = recipients.cc || [];
  const recipientsBcc = recipients.bcc || [];

  const emails = [
    ...recipientsFrom,
    ...recipientsTo,
    ...recipientsCc,
    ...recipientsBcc
  ];
  const emailAddresses = await createContactsIfOrNotStore(
    { contacts: emails, accountId },
    trx
  );
  return knex
    .transaction(async trx => {
      const contactStored = await getContactByEmails(
        { emails: emailAddresses, accountId },
        trx
      );
      const [emailId] = await createEmail({ email, accountId }, trx);
      const from = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsFrom,
        type: 'from'
      });
      const to = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsTo,
        type: 'to'
      });
      const cc = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsCc,
        type: 'cc'
      });
      const bcc = formEmailContact({
        emailId,
        contactStored,
        contacts: recipientsBcc,
        type: 'bcc'
      });
      const emailContactRow = [...from, ...to, ...cc, ...bcc];
      await createEmailContact(emailContactRow, trx);

      const emailLabel = formEmailLabel({
        emailId,
        labels: params.labels
      });
      const emailLabelRow = [...emailLabel];
      await createEmailLabel(emailLabelRow, trx);

      if (params.labels.includes(systemLabels.sent.id)) {
        await updateContactScore(emailId, trx);
      }

      if (params.files) {
        const files = params.files.map(file =>
          Object.assign({ emailId }, file)
        );
        await createFile(files, trx);
      }

      return emailId;
    })
    .then(emailId => {
      return [emailId];
    });
};

const deleteEmailByKeys = ({ keys, accountId }) => {
  return db
    .table(Table.EMAIL)
    .whereIn('key', keys)
    .andWhere('accountId', accountId)
    .del();
};

const deleteEmailsByIds = (ids, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.EMAIL)
    .whereIn('id', ids)
    .del();
};

const deleteEmailsByThreadIdAndLabelId = ({
  threadIds,
  labelId,
  accountId
}) => {
  const labelIdsToDelete = labelId
    ? [labelId]
    : [systemLabels.spam.id, systemLabels.trash.id];
  return db
    .table(Table.EMAIL)
    .whereIn('threadId', threadIds)
    .whereExists(
      db
        .select('*')
        .from(Table.EMAIL_LABEL)
        .whereRaw(
          `${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId and ${
            Table.EMAIL_LABEL
          }.labelId in (??)`,
          [labelIdsToDelete]
        )
    )
    .andWhere('accountId', accountId)
    .del();
};

const getTrashExpiredEmails = () => {
  const labelId = systemLabels.trash.id;
  const daysAgo = 30;
  return db
    .select(`${Table.EMAIL}.*`)
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .where(`${Table.EMAIL_LABEL}.labelId`, labelId)
    .whereNotNull(`${Table.EMAIL}.trashDate`)
    .andWhere(
      db.raw(
        `DATETIME(${
          Table.EMAIL
        }.trashDate) < DATETIME('now','-${daysAgo} days')`
      )
    );
};

const deleteEmailLabelAndContactByEmailId = ({ id, optionalEmailToSave }) => {
  return db.transaction(async trx => {
    await deleteEmailsByIds([id], trx);
    await deleteEmailContactByEmailId(id, trx);
    await deleteEmailLabelsByEmailId(id, trx);
    if (optionalEmailToSave) {
      const [emailId] = await createEmail(optionalEmailToSave, trx);
      return emailId;
    }
  });
};

const formEmailContact = ({ emailId, contactStored, contacts, type }) => {
  return contacts.map(contactToSearch => {
    const emailMatched = contactToSearch.match(HTMLTagsRegex);
    let email;
    if (emailMatched) {
      const lastPosition = emailMatched.length - 1;
      email = emailMatched[lastPosition].replace(/[<>]/g, '');
    } else {
      email = contactToSearch;
    }
    const { id } = contactStored.find(
      contact => contact.email === email.toLowerCase()
    );
    return {
      emailId,
      contactId: id,
      type
    };
  });
};

const formEmailLabel = ({ emailId, labels }) => {
  return labels.map(labelId => {
    return {
      labelId,
      emailId
    };
  });
};

const getEmailsByIds = ids => {
  return db
    .select('*')
    .from(Table.EMAIL)
    .whereIn('id', ids);
};

const getEmailByKey = ({ key, accountId }) => {
  return db
    .select('*')
    .from(Table.EMAIL)
    .where({ key })
    .andWhere('accountId', accountId);
};

const getEmailsByKeys = ({ keys, accountId }) => {
  return db
    .select('*')
    .from(Table.EMAIL)
    .whereIn('key', keys)
    .andWhere('accountId', accountId);
};

const getEmailsByLabelIds = ({ labelIds, accountId }) => {
  return db
    .select(`${Table.EMAIL}.*`)
    .from(Table.EMAIL)
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .whereIn(`${Table.EMAIL_LABEL}.labelId`, labelIds)
    .andWhere('accountId', accountId);
};

const getEmailsByThreadId = ({ threadId, accountId }) => {
  const query = `SELECT ${Table.EMAIL}.*,
  GROUP_CONCAT(DISTINCT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'from' THEN ${
    Table.EMAIL_CONTACT
  }.contactId ELSE NULL END)) as 'fromContactIds',
  GROUP_CONCAT(DISTINCT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'to' THEN ${
    Table.EMAIL_CONTACT
  }.contactId ELSE NULL END)) as 'to',
  GROUP_CONCAT(DISTINCT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'cc' THEN ${
    Table.EMAIL_CONTACT
  }.contactId ELSE NULL END)) as 'cc',
  GROUP_CONCAT(DISTINCT(CASE WHEN ${Table.EMAIL_CONTACT}.type = 'bcc' THEN ${
    Table.EMAIL_CONTACT
  }.contactId ELSE NULL END)) as 'bcc',
  GROUP_CONCAT(DISTINCT(${Table.FILE}.token)) as fileTokens,
  GROUP_CONCAT(DISTINCT(${Table.EMAIL_LABEL}.labelId)) as labelIds
  FROM ${Table.EMAIL}
  LEFT JOIN ${Table.EMAIL_CONTACT} ON ${Table.EMAIL_CONTACT}.emailId = ${
    Table.EMAIL
  }.id
  LEFT JOIN ${Table.FILE} ON ${Table.FILE}.emailId = ${Table.EMAIL}.id
  LEFT JOIN ${Table.EMAIL_LABEL} ON ${Table.EMAIL_LABEL}.emailId = ${
    Table.EMAIL
  }.id
  WHERE threadId = '${threadId}' AND accountId = ${accountId}
  GROUP BY ${Table.EMAIL}.id
  `;
  return db.raw(query);
};

const getEmailsCounterByLabelId = ({ labelId, accountId }) => {
  const query = `SELECT COUNT(DISTINCT ${Table.EMAIL}.id) AS count
  FROM ${Table.EMAIL}
  LEFT JOIN ${Table.EMAIL_LABEL} ON ${Table.EMAIL}.id = ${
    Table.EMAIL_LABEL
  }.emailId
  WHERE ${Table.EMAIL_LABEL}.labelId = ${labelId}
  AND ${Table.EMAIL}.accountId = ${accountId}`;
  return db.raw(query);
};

const formStringSeparatedByOperator = (array, operator = ',') => {
  return array.reduce((result, item, index) => {
    if (index > 0) {
      return `${result}${operator} ${item}`;
    }
    return `${item}`;
  }, '');
};

const getEmailsGroupByThreadByParams = (params = {}) => {
  const {
    accountId = myAccount.id,
    contactFilter,
    contactTypes = ['from'],
    date,
    labelId,
    limit,
    plain,
    rejectedLabelIds,
    subject,
    threadIdRejected,
    text,
    unread
  } = params;
  const excludedLabels = [systemLabels.trash.id, systemLabels.spam.id];
  const isRejectedLabel = excludedLabels.includes(labelId);
  let rejectedLabelIdsString;
  if (rejectedLabelIds) {
    rejectedLabelIdsString = formStringSeparatedByOperator(rejectedLabelIds);
  }

  let labelSelectQuery;
  let labelWhereQuery;
  if (isRejectedLabel) {
    labelSelectQuery = `GROUP_CONCAT((SELECT GROUP_CONCAT(${
      Table.EMAIL_LABEL
    }.labelId)
  FROM ${Table.EMAIL_LABEL} WHERE ${Table.EMAIL_LABEL}.emailId = ${
      Table.EMAIL
    }.id
  AND ${
    Table.EMAIL_LABEL
  }.labelId NOT IN (${rejectedLabelIdsString}))) as allLabels,`;
    labelWhereQuery = `WHERE ${Table.EMAIL_LABEL}.labelId = ${labelId}`;
  } else {
    labelSelectQuery = `GROUP_CONCAT(DISTINCT(${
      Table.EMAIL_LABEL
    }.labelId)) as allLabels,`;
    labelWhereQuery = `WHERE NOT EXISTS (SELECT * FROM ${Table.EMAIL_LABEL} 
    WHERE ${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId 
    AND ${Table.EMAIL_LABEL}.labelId IN (${rejectedLabelIdsString}))`;
  }

  let contactQuery;
  if (contactFilter) {
    contactQuery = contactTypes.reduce((query, type) => {
      const contactFilterValue = contactFilter[type];
      let tmpQuery;
      if (type === 'from') {
        tmpQuery = `(${
          Table.EMAIL
        }.fromAddress LIKE "%${contactFilterValue}%")`;
      } else {
        tmpQuery = `(${Table.EMAIL_CONTACT}.type = "${type}"
      AND ${Table.CONTACT}.name LIKE "%${contactFilterValue}%"
      OR ${Table.CONTACT}.email LIKE "%${contactFilterValue}%")`;
      }
      if (!query) return tmpQuery;
      return `${query} OR ${tmpQuery}`;
    }, '');
  } else {
    contactQuery = `${Table.CONTACT}.id IS NOT NULL`;
  }

  let contactNameQuery;
  if (contactTypes.includes('from')) {
    contactNameQuery = `GROUP_CONCAT(DISTINCT(${
      Table.EMAIL
    }.fromAddress)) as fromContactName,`;
  } else {
    contactNameQuery = `GROUP_CONCAT(DISTINCT(${
      Table.CONTACT
    }.email)) as fromContactName,`;
  }

  const emailContactOrQuery = contactTypes[1]
    ? `OR ${Table.EMAIL_CONTACT}.type = "${contactTypes[1]}"`
    : null;

  const textQuery = plain
    ? `AND (preview LIKE "%${text}%" OR subject LIKE "%${text}%" OR fromAddress LIKE "%${text}%")`
    : '';

  let matchContactQuery;
  if (contactFilter) {
    if (contactFilter.from)
      matchContactQuery = `HAVING matchedContacts LIKE '%from%'`;
    if (contactFilter.to) {
      matchContactQuery = `${
        matchContactQuery ? 'AND' : 'HAVING'
      } matchedContacts LIKE '%to%'`;
    }
  }

  const query = `SELECT ${Table.EMAIL}.*,
    IFNULL(${Table.EMAIL}.threadId ,${Table.EMAIL}.id) as uniqueId,
    ${labelSelectQuery}
    GROUP_CONCAT(DISTINCT(${Table.EMAIL}.id)) as emailIds,
    GROUP_CONCAT(DISTINCT(CASE WHEN ${contactQuery} THEN ${
    Table.EMAIL_CONTACT
  }.type ELSE NULL END)) as matchedContacts,
    ${contactNameQuery}
    GROUP_CONCAT(DISTINCT(${Table.CONTACT}.id)) as recipientContactIds,
    GROUP_CONCAT(DISTINCT(${Table.FILE}.token)) as fileTokens,
    MAX(${Table.EMAIL}.unread) as unread,
    MAX(email.date) as maxDate
    from ${Table.EMAIL}
    LEFT JOIN ${Table.EMAIL_LABEL} ON ${Table.EMAIL}.id = ${
    Table.EMAIL_LABEL
  }.emailId
    LEFT JOIN ${Table.FILE} ON ${Table.EMAIL}.id = ${Table.FILE}.emailId
    LEFT JOIN ${Table.EMAIL_CONTACT} ON ${Table.EMAIL}.id = ${
    Table.EMAIL_CONTACT
  }.emailId AND (${Table.EMAIL_CONTACT}.type = "${
    contactTypes[0]
  }" ${emailContactOrQuery || ''})
    LEFT JOIN ${Table.CONTACT} ON ${Table.EMAIL_CONTACT}.contactId = ${
    Table.CONTACT
  }.id
  ${labelWhereQuery}
  ${threadIdRejected ? `AND uniqueId NOT IN ('${threadIdRejected}')` : ''}
  AND ${Table.EMAIL}.date < '${date || 'date("now")'}'
  AND ${Table.EMAIL}.accountId = ${accountId}
  ${textQuery}
  ${subject ? `AND subject LIKE %${subject}%` : ''}
  ${unread !== undefined ? `AND unread = ${unread}` : ''}
    GROUP BY uniqueId
    ${labelId > 0 ? `HAVING allLabels LIKE "%${labelId}%"` : ''}
    ${matchContactQuery || ''}
    ORDER BY ${Table.EMAIL}.date DESC
    LIMIT ${limit || 22}`;

  return db.raw(query);
};

const getEmailsByThreadIdAndLabelId = ({ threadIds, labelId, accountId }) => {
  return db
    .select(
      `${Table.EMAIL}.*`,
      db.raw(`GROUP_CONCAT(${Table.EMAIL}.key) as keys`)
    )
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .from(Table.EMAIL)
    .where(`${Table.EMAIL_LABEL}.labelId`, labelId)
    .whereIn(`${Table.EMAIL}.threadId`, threadIds)
    .andWhere('accountId', accountId)
    .groupBy(`${Table.EMAIL}.threadId`)
    .then(rows => {
      return rows.map(row => ({
        id: row.id,
        threadId: row.threadId,
        keys: row.keys ? row.keys.split(',').map(Number) : []
      }));
    });
};

const getEmailsToDeleteByThreadIdAndLabelId = (
  threadIds,
  labelId,
  accountId
) => {
  const labelIdsToDelete = labelId
    ? [labelId]
    : [systemLabels.spam.id, systemLabels.trash.id];
  return db
    .select(
      `${Table.EMAIL}.*`,
      db.raw(`GROUP_CONCAT(${Table.EMAIL}.key) as keys`)
    )
    .leftJoin(
      Table.EMAIL_LABEL,
      `${Table.EMAIL}.id`,
      `${Table.EMAIL_LABEL}.emailId`
    )
    .from(Table.EMAIL)
    .whereIn(`${Table.EMAIL_LABEL}.labelId`, labelIdsToDelete)
    .whereIn(`${Table.EMAIL}.threadId`, threadIds)
    .andWhere('accountId', accountId)
    .groupBy(`${Table.EMAIL}.threadId`)
    .then(rows => {
      return rows.map(row => ({
        id: row.id,
        threadId: row.threadId,
        keys: row.keys ? row.keys.split(',').map(Number) : []
      }));
    });
};

const getEmailsUnredByLabelId = params => {
  const { labelId, rejectedLabelIds, accountId } = params;
  const rejectedLabelIdsString = rejectedLabelIds
    ? formStringSeparatedByOperator(rejectedLabelIds)
    : null;
  let queryRejected;
  if (rejectedLabelIdsString) {
    queryRejected = `WHERE NOT EXISTS (SELECT * FROM ${
      Table.EMAIL_LABEL
    } WHERE ${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId AND ${
      Table.EMAIL_LABEL
    }.labelId IN (${rejectedLabelIdsString})) AND unread = 1`;
  } else {
    queryRejected = `WHERE unread = 1`;
  }
  const query = `SELECT IFNULL(${Table.EMAIL}.threadId ,${
    Table.EMAIL
  }.id) as uniqueId,
  GROUP_CONCAT(${Table.EMAIL_LABEL}.labelId) as allLabels
  FROM ${Table.EMAIL}
  LEFT JOIN ${Table.EMAIL_LABEL} ON ${Table.EMAIL}.id = ${
    Table.EMAIL_LABEL
  }.emailId
  ${queryRejected}
  AND accountId = ${accountId}
  GROUP BY uniqueId
  HAVING allLabels LIKE '%${labelId}%'`;
  return db.raw(query);
};

const updateEmail = ({
  accountId,
  id,
  key,
  threadId,
  date,
  isMuted,
  unread,
  status,
  content,
  preview,
  unsendDate,
  messageId
}) => {
  const params = noNulls({
    key,
    threadId,
    date,
    unread: typeof unread === 'boolean' ? unread : undefined,
    isMuted: typeof isMuted === 'boolean' ? isMuted : undefined,
    status,
    content,
    preview,
    unsendDate,
    messageId
  });
  const whereParam = id ? { id } : { key };
  let query = db.table(Table.EMAIL).where(whereParam);
  if (!id) {
    query = query.andWhere('accountId', accountId);
  }
  return query.update(params);
};

const updateEmails = ({ accountId, ids, keys, unread, trashDate }, trx) => {
  const knex = trx || db;
  const params = noNulls({
    unread: typeof unread === 'boolean' ? unread : undefined,
    trashDate
  });
  const { whereParamName, whereParamValue } = ids
    ? { whereParamName: 'id', whereParamValue: ids }
    : { whereParamName: 'key', whereParamValue: keys };
  let query = knex.table(Table.EMAIL).whereIn(whereParamName, whereParamValue);
  if (!ids) {
    query = query.andWhere('accountId', accountId);
  }
  return query.update(params);
};

const updateUnreadEmailByThreadIds = ({ threadIds, unread, accountId }) => {
  const params = {};
  if (typeof unread === 'boolean') params.unread = unread;
  return db
    .table(Table.EMAIL)
    .whereIn('threadId', threadIds)
    .andWhere('accountId', accountId)
    .update(params);
};

/* Label
----------------------------- */
const createLabel = ({ params, accountId = null }) => {
  let labelsToInsert;
  const isLabelArray = Array.isArray(params);
  if (isLabelArray) {
    labelsToInsert = params.map(labelParams => {
      if (!labelParams.uuid) {
        return Object.assign(
          {
            accountId: accountId,
            uuid: genUUID()
          },
          labelParams
        );
      }
      return Object.assign({ accountId: accountId }, labelParams);
    });
  } else {
    if (!params.uuid) {
      labelsToInsert = Object.assign(
        {
          accountId: accountId,
          uuid: genUUID()
        },
        params
      );
    }
    labelsToInsert = Object.assign({ accountId: accountId }, params);
  }
  return db.table(Table.LABEL).insert(labelsToInsert);
};

const deleteLabelById = id => {
  return db.transaction(async trx => {
    const emailLabels = await trx
      .select('*')
      .from(Table.EMAIL_LABEL)
      .where('labelId', id);
    const emailsId = emailLabels.map(item => item.emailId);
    if (emailsId.length) {
      await deleteEmailLabel({ emailsId, labelId: id }, trx);
    }
    return trx
      .table(Table.LABEL)
      .where({ id })
      .del();
  });
};

const getAllLabels = accountId => {
  return db
    .select('*')
    .from(Table.LABEL)
    .whereNull('accountId', null)
    .orWhere('accountId', accountId);
};

const getLabelById = id => {
  return db
    .select('*')
    .from(Table.LABEL)
    .where({ id });
};

const getLabelsByParams = async ({ textArray, accountId = null }) => {
  let labels = [];
  for (const text of textArray) {
    const labelsMatched = await db
      .select('*')
      .from(Table.LABEL)
      .where('text', 'like', `${text}`);
    const filtered = labelsMatched.filter(
      label =>
        label.type === 'system' ||
        (label.type === 'custom' && label.accountId === accountId)
    );
    labels = labels.concat(filtered);
  }
  return labels;
};

const updateLabel = ({ id, color, text, visible }) => {
  const params = {};
  if (color) params.color = color;
  if (text) params.text = text;
  if (typeof visible === 'boolean') params.visible = visible;
  return db
    .table(Table.LABEL)
    .where({
      id
    })
    .update(params);
};

/* File
----------------------------- */
const createFile = (files, trx) => {
  const knex = trx || db;
  return knex.insert(files).into(Table.FILE);
};

const getFilesByEmailId = emailId => {
  return db
    .select('*')
    .from(Table.FILE)
    .where({ emailId });
};

const getFilesByTokens = tokens => {
  return db
    .select('*')
    .from(Table.FILE)
    .whereIn('token', tokens);
};

const updateFilesByEmailId = ({ emailId, status }) => {
  const params = {};
  if (typeof status === 'number') params.status = status;
  return db
    .table(Table.FILE)
    .where({ emailId })
    .update(params);
};

/* Feed Item
----------------------------- */
const createFeedItem = params => {
  return db.table(Table.FEEDITEM).insert(params);
};

const deleteFeedItemById = id => {
  return db
    .table(Table.FEEDITEM)
    .where({ id })
    .del();
};

const getAllFeedItems = () => {
  return db.select('*').from(Table.FEEDITEM);
};

const updateFeedItem = ({ id, seen }) => {
  const params = {};
  if (seen) params.seen = seen;
  return db
    .table(Table.FEEDITEM)
    .where({ id })
    .update(params);
};

/* PreKeyRecord
----------------------------- */
const createPreKeyRecord = params => {
  return db.table(Table.PREKEYRECORD).insert(params);
};

const deletePreKeyPair = params => {
  return db
    .table(Table.PREKEYRECORD)
    .where(params)
    .del();
};

const getPreKeyRecordIds = accountId => {
  return db
    .select('preKeyId')
    .from(Table.PREKEYRECORD)
    .where('accountId', accountId)
    .then(preKeyIds => preKeyIds.map(obj => obj.preKeyId));
};

const getPreKeyPair = params => {
  return db
    .select('preKeyPrivKey', 'preKeyPubKey')
    .from(Table.PREKEYRECORD)
    .where(params);
};

/* SignedPreKeyRecord
----------------------------- */
const createSignedPreKeyRecord = params => {
  return db.table(Table.SIGNEDPREKEYRECORD).insert(params);
};

const getSignedPreKey = params => {
  return db
    .select('signedPreKeyPrivKey', 'signedPreKeyPubKey')
    .from(Table.SIGNEDPREKEYRECORD)
    .where(params);
};

/* SessionRecord
----------------------------- */
const createSessionRecord = params => {
  const { recipientId, deviceId, accountId } = params;
  return db
    .transaction(async trx => {
      await deleteSessionRecord({ recipientId, deviceId, accountId }, trx);
      return trx.table(Table.SESSIONRECORD).insert(params);
    })
    .then(result => {
      return result;
    });
};

const deleteSessionRecord = (params, trx) => {
  const knex = trx || db;
  return knex
    .table(Table.SESSIONRECORD)
    .where(params)
    .del();
};

const getSessionRecord = params => {
  return db
    .select('record')
    .from(Table.SESSIONRECORD)
    .where(params);
};

const getSessionRecordByRecipientIds = ({ recipientIds, accountId }) => {
  return db
    .select(
      'recipientId',
      db.raw(
        `GROUP_CONCAT(DISTINCT(${Table.SESSIONRECORD}.deviceId)) as deviceIds`
      )
    )
    .from(Table.SESSIONRECORD)
    .whereIn('recipientId', recipientIds)
    .andWhere('accountId', accountId)
    .groupBy(`${Table.SESSIONRECORD}.recipientId`);
};

/* IdentityKeyRecord
----------------------------- */
const createIdentityKeyRecord = params => {
  return db.table(Table.IDENTITYKEYRECORD).insert(params);
};

const getIdentityKeyRecord = params => {
  return db
    .select('identityKey')
    .from(Table.IDENTITYKEYRECORD)
    .where(params);
};

const updateIdentityKeyRecord = ({ recipientId, identityKey, accountId }) => {
  return db
    .table(Table.IDENTITYKEYRECORD)
    .where({ recipientId })
    .andWhere('accountId', accountId)
    .update({ identityKey });
};

/* Pending Event
----------------------------- */
const createPendingEvent = params => {
  return db.table(Table.PENDINGEVENT).insert(params);
};

const getPendingEvents = accountId => {
  return db
    .select('*')
    .from(Table.PENDINGEVENT)
    .where('accountId', accountId);
};

const deletePendingEventsByIds = ({ ids, accountId }) => {
  return db
    .table(Table.PENDINGEVENT)
    .whereIn('id', ids)
    .andWhere('accountId', accountId)
    .del();
};

/* Settings
----------------------------- */
const getSettings = async () => {
  const [appSettings] = await db.table(Table.SETTINGS).where({ id: 1 });
  return appSettings;
};

const updateSettings = async ({ language, opened, theme }) => {
  const params = noNulls({ language, opened, theme });
  if (Object.keys(params).length < 1) {
    return Promise.resolve(true);
  }
  const dbResponse = await db
    .table(Table.SETTINGS)
    .where({ id: 1 })
    .update(params);
  mySettings.update(params);
  if (params.language) {
    setLanguage(params.language);
  }
  return dbResponse;
};

const closeDB = () => {
  db.close();
  db.disconnect();
};

module.exports = {
  cleanDataBase,
  cleanDataLogout,
  closeDB,
  createAccount,
  createAccountContact,
  createContact,
  createFile,
  createLabel,
  createEmail,
  createEmailLabel,
  createPendingEvent,
  createFeedItem,
  createIdentityKeyRecord,
  createPreKeyRecord,
  createSessionRecord,
  createSignedPreKeyRecord,
  createSignalTables,
  createTables,
  defineActiveAccountById,
  deleteAccountByParams,
  deleteAccountContact,
  deleteEmailsByIds,
  deleteEmailByKeys,
  deleteEmailsByThreadIdAndLabelId,
  deleteEmailLabelAndContactByEmailId,
  deleteEmailContactByEmailId,
  deleteEmailLabel,
  deleteEmailLabelsByEmailId,
  deleteLabelById,
  deleteFeedItemById,
  deletePendingEventsByIds,
  deletePreKeyPair,
  deleteSessionRecord,
  getAccount,
  getAccountByParams,
  getAllContacts,
  getAllFeedItems,
  getAllLabels,
  getContactByEmails,
  getContactByIds,
  getContactsByEmailId,
  getEmailsByIds,
  getEmailByKey,
  getEmailsByKeys,
  getEmailsByLabelIds,
  getEmailsByThreadId,
  getEmailsCounterByLabelId,
  getEmailsGroupByThreadByParams,
  getEmailsByThreadIdAndLabelId,
  getEmailsToDeleteByThreadIdAndLabelId,
  getEmailsUnredByLabelId,
  getEmailLabelsByEmailId,
  getFilesByEmailId,
  getPendingEvents,
  getIdentityKeyRecord,
  getLabelById,
  getLabelsByParams,
  getPreKeyPair,
  getPreKeyRecordIds,
  getSessionRecord,
  getSessionRecordByRecipientIds,
  getSettings,
  getSignedPreKey,
  getTrashExpiredEmails,
  getFilesByTokens,
  updateAccount,
  updateContactByEmail,
  updateEmail,
  updateEmails,
  updateFeedItem,
  updateFilesByEmailId,
  updateIdentityKeyRecord,
  updateLabel,
  updateSettings,
  updateUnreadEmailByThreadIds
};
