const {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Identitykeyrecord,
  Label,
  Pendingevent,
  Prekeyrecord,
  Sessionrecord,
  Settings,
  Signedprekeyrecord,
  deleteDatabase,
  getDB,
  initDatabaseEncrypted,
  resetKeyDatabase,
  Op,
  Table,
  databasePath
} = require('./DBEmodel.js');
const moment = require('moment');
const { noNulls } = require('../utils/ObjectUtils');
const { formContactsRow } = require('../utils/dataTableUtils.js');
const { HTMLTagsRegex } = require('../utils/RegexUtils');
const { parseDate } = require('../utils/TimeUtils');
const { genUUID } = require('../utils/stringUtils');
const { setLanguage } = require('../lang');
const systemLabels = require('../systemLabels');
const myAccount = require('../Account');
const mySettings = require('../Settings');

const EMAIL_CONTACT_TYPE_FROM = 'from';

/* Account
----------------------------- */
const createAccount = params => {
  return Account().create(params);
};

const getAccount = () => {
  if (!getDB()) return [];
  return Account()
    .findAll()
    .map(account => account.toJSON());
};

const getAccountByParams = params => {
  if (!getDB()) return [];
  return Account()
    .findAll({ where: params })
    .map(account => account.toJSON());
};

const updateAccount = ({
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
  signFooter
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
    signFooter: typeof signFooter === 'boolean' ? signFooter : undefined
  });

  myAccount.update(params);
  return Account().update(params, {
    where: { recipientId: { [Op.eq]: recipientId } }
  });
};

/* Contact
----------------------------- */
const createContact = params => {
  return Contact().bulkCreate(params);
};

const createContactsIfOrNotStore = async (contacts, trx) => {
  const parsedContacts = filterUniqueContacts(formContactsRow(contacts));
  const contactsMap = parsedContacts.reduce((contactsObj, contact) => {
    contactsObj[contact.email] = contact;
    return contactsObj;
  }, {});
  const emailAddresses = Object.keys(contactsMap);
  const contactsFound = await Contact().findAll({
    where: { email: emailAddresses },
    transaction: trx
  });
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
    await Contact().bulkCreate(newContacts, { transaction: trx });
  }
  if (contactsToUpdate.length) {
    await Promise.all(
      contactsToUpdate.map(contact => updateContactByEmail(contact, trx))
    );
  }
  return emailAddresses;
};

const getAllContacts = () => {
  return Contact().findAll({
    attributes: ['name', 'email'],
    order: [['score', 'DESC'], ['name']],
    raw: true
  });
};

const getContactByEmails = (emails, trx) => {
  return Contact().findAll({
    attributes: ['id', 'email', 'score', 'spamScore'],
    where: { email: emails },
    raw: true,
    transaction: trx
  });
};

const getContactByIds = (ids, trx) => {
  return Contact().findAll({
    attributes: ['id', 'email', 'name'],
    where: { id: ids },
    raw: true,
    transaction: trx
  });
};

const updateContactByEmail = ({ email, name }, trx) => {
  return Contact().update(
    { name },
    { where: { email: { [Op.eq]: email } }, transaction: trx }
  );
};

const updateContactScore = async (emailId, trx) => {
  const sequelize = getDB();
  const emailContacts = await EmailContact().findAll({
    attributes: [
      [sequelize.fn('GROUP_CONCAT', sequelize.col('contactId')), 'contactId']
    ],
    where: { emailId, type: { [Op.ne]: EMAIL_CONTACT_TYPE_FROM } },
    transaction: trx
  });
  const ids = emailContacts[0].contactId.split(',').map(Number);
  await Contact().update(
    { score: sequelize.literal('score + 1') },
    { where: { id: ids }, transaction: trx }
  );
};

const updateContactSpamScore = ({ emailIds, notEmailAddress, value }) => {
  const sequelize = getDB();
  return EmailContact()
    .findAll({
      attributes: [
        [sequelize.fn('GROUP_CONCAT', sequelize.col('contactId')), 'contactId']
      ],
      where: { emailId: emailIds, type: EMAIL_CONTACT_TYPE_FROM }
    })
    .then(result => {
      const contactIds = Array.from(new Set(result[0].contactId.split(',')));
      return Contact().update(
        { spamScore: sequelize.literal(`spamScore + ${value}`) },
        {
          where: { id: contactIds, email: { [Op.not]: notEmailAddress } }
        }
      );
    });
};

/* Email
----------------------------- */
const createEmail = (params, prevTrx) => {
  const { recipients, email } = params;
  if (!recipients) {
    const emailData = Array.isArray(email)
      ? email.map(clearAndFormatDateEmails)
      : clearAndFormatDateEmails(email);
    return Email()
      .create(emailData, { transaction: prevTrx })
      .then(email => email.toJSON());
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
  return createOrUseTrx(prevTrx, async trx => {
    const emailAddresses = await createContactsIfOrNotStore(emails, trx);
    const contactStored = await getContactByEmails(emailAddresses, trx);
    const emailCreated = await createEmail({ email }, trx);
    const emailId = emailCreated.id;
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
      const files = params.files.map(file => Object.assign({ emailId }, file));
      await createFile(files, trx);
    }
    return emailCreated;
  });
};

const deleteEmailByKeys = keys => {
  return Email().destroy({ where: { key: keys } });
};

const deleteEmailsByIds = (ids, trx) => {
  return Email().destroy({ where: { id: ids }, transaction: trx });
};

const deleteEmailsByThreadIdAndLabelId = (threadIds, labelId) => {
  const labelIdsToDelete = labelId
    ? labelId
    : `${systemLabels.spam.id}, ${systemLabels.trash.id}`;
  return Email().destroy({
    where: {
      threadId: threadIds,
      [Op.and]: [
        getDB().literal(
          `exists (select * from EmailLabel where Email.id = EmailLabel.emailId AND EmailLabel.labelId IN (${labelIdsToDelete}))`
        )
      ]
    }
  });
};

const getEmailByKey = key => {
  return Email()
    .findAll({ where: { key } })
    .map(email => email.toJSON());
};

const getEmailByParams = params => {
  return Email().findAll({ where: params });
};

const getEmailsByArrayParam = params => {
  const key = Object.keys(params)[0];
  const value = params[key];
  const param = key.slice(0, -1);

  return Email()
    .findAll({ where: { [param]: value } })
    .map(email => email.toJSON());
};

const getEmailsByIds = ids => {
  const idsString = formStringSeparatedByOperator(ids);
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
  WHERE ${Table.EMAIL}.id IN (${idsString})
  GROUP BY ${Table.EMAIL}.id
  `;
  return getDB().query(query, {
    type: getDB().QueryTypes.SELECT
  });
};

const getEmailsByLabelIds = labelIds => {
  return Email().findAll({
    include: [
      {
        model: EmailLabel(),
        where: { labelId: labelIds }
      }
    ]
  });
};

const getEmailsByThreadId = threadId => {
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
  WHERE threadId = '${threadId}'
  GROUP BY ${Table.EMAIL}.id
  `;
  return getDB()
    .query(query, {
      type: getDB().QueryTypes.SELECT
    })
    .then(rows => {
      return rows.map(row => {
        return {
          ...row,
          date: parseDate(new Date(row.date)),
          unsentDate: parseDate(new Date(row.unsentDate))
        };
      });
    });
};

const getEmailsByThreadIdAndLabelId = (threadIds, labelId) => {
  const sequelize = getDB();
  return Email()
    .findAll({
      attributes: [
        'id',
        'threadId',
        'trashDate',
        [sequelize.fn('GROUP_CONCAT', sequelize.col('key')), 'keys']
      ],
      include: [
        {
          model: EmailLabel(),
          where: { labelId }
        }
      ],
      where: { threadId: threadIds },
      group: ['threadId']
    })
    .map(email => email.toJSON());
};

const getEmailsCounterByLabelId = labelId => {
  return Email().count({
    distinct: 'id',
    include: [{ model: EmailLabel(), where: { labelId } }]
  });
};

const getEmailsGroupByThreadByParams = async (params = {}) => {
  if (params.plain === false)
    return getEmailsGroupByThreadByParamsToSearch(params);
  const sequelize = getDB();
  const {
    contactTypes = ['from'],
    date,
    labelId,
    limit,
    plain,
    rejectedLabelIds,
    threadIdRejected,
    subject,
    text,
    unread
  } = params;
  const excludedLabels = [systemLabels.trash.id, systemLabels.spam.id];
  const isRejectedLabel = excludedLabels.includes(labelId);
  const systemLabelIdsExcludeStarred = Object.values(systemLabels)
    .filter(label => label.id !== 5)
    .map(label => label.id);
  const allMailLabelId = -1;
  const searchLabelId = -2;
  systemLabelIdsExcludeStarred.push(allMailLabelId);
  systemLabelIdsExcludeStarred.push(searchLabelId);
  const isCustomLabel = !systemLabelIdsExcludeStarred.includes(labelId);

  const labelSelectQuery = `GROUP_CONCAT(DISTINCT(${
    Table.EMAIL_LABEL
  }.labelId)) as labels,
     GROUP_CONCAT(DISTINCT('L' || ${
       Table.EMAIL_LABEL
     }.labelId || 'L')) as myLabels`;

  let customRejectedLabels =
    'HAVING ' +
    rejectedLabelIds
      .map(rejectedLabelId => `myLabels not like "%L${rejectedLabelId}L%"`)
      .join(' and ');
  if (isRejectedLabel || isCustomLabel) {
    customRejectedLabels += ` AND myLabels like "%L${labelId}L%"`;
  }
  customRejectedLabels += ` OR myLabels is null`;

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

  const query = `
    SELECT *, 
      MAX(unread) as unread, 
      MAX(date) as maxDate,
      GROUP_CONCAT(DISTINCT(id)) as emailIds,
      GROUP_CONCAT(DISTINCT(myLabels)) as myAllLabels,
      GROUP_CONCAT(DISTINCT(labels)) as allLabels
    FROM (
      SELECT ${Table.EMAIL}.*,
        IFNULL(${Table.EMAIL}.threadId ,${Table.EMAIL}.id) as uniqueId,
        ${labelSelectQuery}
      FROM ${Table.EMAIL}
      ${labelId < 0 ? 'LEFT' : ''} JOIN ${Table.EMAIL_LABEL} ON ${
    Table.EMAIL
  }.id = ${Table.EMAIL_LABEL}.emailId
      ${threadIdRejected ? `AND uniqueId NOT IN ('${threadIdRejected}')` : ''}
      WHERE ${Table.EMAIL}.date < '${date || 'date("now")'}'
      ${textQuery}
      ${subject ? `AND subject LIKE "%${subject}%"` : ''}
      ${unread !== undefined ? `AND unread = ${unread}` : ''}
      GROUP BY uniqueId, ${Table.EMAIL_LABEL}.emailId
      ${customRejectedLabels}
      ORDER BY ${Table.EMAIL}.date DESC
    )
    GROUP BY threadId
    ${labelId > 0 ? `HAVING myAllLabels LIKE "%L${labelId}L%"` : ''}
    ORDER BY date DESC
    LIMIT ${limit || 22}`;

  const threads = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT
  });
  const emailIds = threads.reduce((result, thread) => {
    const emailIds = thread.emailIds;
    return result ? `${result},${emailIds}` : emailIds;
  }, '');
  const files = await sequelize.query(
    `SELECT ${Table.EMAIL}.threadId,
    GROUP_CONCAT(DISTINCT(${Table.FILE}.token)) as fileTokens
    FROM ${Table.EMAIL}
    LEFT JOIN ${Table.FILE} ON ${Table.EMAIL}.id = ${Table.FILE}.emailId
    WHERE ${Table.EMAIL}.id IN (${emailIds})
    GROUP BY ${Table.EMAIL}.threadId`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const filesObj = files.reduce(
    (result, element) => ({
      ...result,
      [element.threadId]: element
    }),
    {}
  );
  const contacts = await sequelize.query(
    `SELECT ${Table.EMAIL}.threadId,
    ${contactNameQuery}
    GROUP_CONCAT(DISTINCT(${Table.CONTACT}.id)) as recipientContactIds
    FROM ${Table.EMAIL}
    LEFT JOIN ${Table.EMAIL_CONTACT} ON ${Table.EMAIL}.id = ${
      Table.EMAIL_CONTACT
    }.emailId AND (${Table.EMAIL_CONTACT}.type = "${
      contactTypes[0]
    }" ${emailContactOrQuery || ''})
    LEFT JOIN ${Table.CONTACT} ON ${Table.EMAIL_CONTACT}.contactId = ${
      Table.CONTACT
    }.id
    WHERE ${Table.EMAIL}.id IN (${emailIds})
    GROUP BY ${Table.EMAIL}.threadId`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const contactsObj = contacts.reduce(
    (result, element) => ({
      ...result,
      [element.threadId]: element
    }),
    {}
  );
  return threads.map(thread => {
    return {
      ...thread,
      fileTokens: filesObj[thread.threadId].fileTokens,
      fromContactName: contactsObj[thread.threadId].fromContactName,
      recipientContactIds: contactsObj[thread.threadId].recipientContactIds
    };
  });
};

const getEmailsGroupByThreadByParamsToSearch = (params = {}) => {
  const {
    contactFilter,
    contactTypes = ['from'],
    date,
    labelId,
    limit,
    plain,
    rejectedLabelIds,
    threadIdRejected,
    subject,
    text,
    unread,
    searchInLabelId
  } = params;
  const excludedLabels = [systemLabels.trash.id, systemLabels.spam.id];
  const isRejectedLabel = excludedLabels.includes(labelId);
  const labelSelectQuery = `GROUP_CONCAT(DISTINCT(${
    Table.EMAIL_LABEL
  }.labelId)) as labels,
     GROUP_CONCAT(DISTINCT('L' || ${
       Table.EMAIL_LABEL
     }.labelId || 'L')) as myLabels`;

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

  let matchContactQuery =
    'HAVING ' +
    rejectedLabelIds
      .map(rejectedLabelId => `myLabels NOT LIKE "%L${rejectedLabelId}L%"`)
      .join(' and ');
  if (searchInLabelId) {
    matchContactQuery += ` AND myLabels LIKE "%L${searchInLabelId}L%"`;
  } else if (isRejectedLabel) {
    matchContactQuery += ` AND myLabels LIKE "%L${labelId}L%"`;
  }
  matchContactQuery += ` OR myLabels is null`;
  if (contactFilter) {
    if (contactFilter.from)
      matchContactQuery += ` AND matchedContacts LIKE '%from%'`;
    if (contactFilter.to) {
      matchContactQuery += ` AND matchedContacts LIKE '%to%'`;
    }
  }

  const query = `
    SELECT *, 
      MAX(unread) as unread, 
      MAX(date) as maxDate,
      GROUP_CONCAT(DISTINCT(id)) as emailIds,
      GROUP_CONCAT(DISTINCT(myLabels)) as myAllLabels,
      GROUP_CONCAT(DISTINCT(labels)) as allLabels
    FROM (
      SELECT ${Table.EMAIL}.*,
        IFNULL(${Table.EMAIL}.threadId ,${Table.EMAIL}.id) as uniqueId,
        GROUP_CONCAT(DISTINCT(CASE WHEN ${contactQuery} THEN ${
    Table.EMAIL_CONTACT
  }.type ELSE NULL END)) as matchedContacts,
        ${contactNameQuery}
        GROUP_CONCAT(DISTINCT(${Table.CONTACT}.id)) as recipientContactIds,
        GROUP_CONCAT(DISTINCT(${Table.FILE}.token)) as fileTokens,
        ${labelSelectQuery}
      FROM ${Table.EMAIL}
      LEFT JOIN ${Table.EMAIL_LABEL} ON ${Table.EMAIL}.id = ${
    Table.EMAIL_LABEL
  }.emailId
      LEFT JOIN ${Table.FILE} ON ${Table.EMAIL}.id = ${Table.FILE}.emailId
      LEFT JOIN ${Table.EMAIL_CONTACT} ON ${Table.EMAIL}.id = ${
    Table.EMAIL_CONTACT
  }.emailId 
        AND (${Table.EMAIL_CONTACT}.type = "${
    contactTypes[0]
  }" ${emailContactOrQuery || ''})
      LEFT JOIN ${Table.CONTACT} ON ${Table.EMAIL_CONTACT}.contactId = ${
    Table.CONTACT
  }.id
      ${threadIdRejected ? `AND uniqueId NOT IN ('${threadIdRejected}')` : ''}
      WHERE ${Table.EMAIL}.date < '${date || 'date("now")'}'
      ${textQuery}
      ${subject ? `AND subject LIKE "%${subject}%"` : ''}
      ${unread !== undefined ? `AND unread = ${unread}` : ''}
      GROUP BY uniqueId, ${Table.EMAIL_LABEL}.emailId
      ${matchContactQuery}
      ORDER BY ${Table.EMAIL}.date DESC
      LIMIT 100
    )
    GROUP BY threadId
    ${labelId > 0 ? `HAVING myAllLabels LIKE "%L${labelId}L%"` : ''}
    ORDER BY date DESC
    LIMIT ${limit || 22}`;

  const sequelize = getDB();
  return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
};

const getEmailsToDeleteByThreadIdAndLabelId = (threadIds, labelId) => {
  const sequelize = getDB();
  const labelIdsToDelete = labelId
    ? [labelId]
    : [systemLabels.spam.id, systemLabels.trash.id];
  return Email()
    .findAll({
      attributes: [
        [sequelize.fn('GROUP_CONCAT', sequelize.col('key')), 'key'],
        'id',
        'threadId'
      ],
      include: [
        {
          model: EmailLabel(),
          where: { labelId: labelIdsToDelete }
        }
      ],
      where: { threadId: threadIds },
      group: ['threadId']
    })
    .then(rows => {
      return rows.reduce((result, row) => {
        const key = row.key ? row.key.split(',').map(Number) : [];
        return [...result, ...key];
      }, []);
    });
};

const getEmailsUnredByLabelId = async params => {
  const sequelize = getDB();
  const { labelId, rejectedLabelIds } = params;
  const excludedLabels = [systemLabels.trash.id, systemLabels.spam.id];
  const isRejectedLabel = excludedLabels.includes(labelId);

  let havingClause = `HAVING myLabels LIKE "%L${labelId}L%"`;
  if (!isRejectedLabel) {
    havingClause = rejectedLabelIds.reduce((havingQuery, rejectedLabelId) => {
      havingQuery += ` AND myLabels NOT LIKE "%L${rejectedLabelId}L%"`;
      return havingQuery;
    }, havingClause);
  }

  const query = `
   SELECT count(*) as totalUnread
   FROM (
     SELECT
      IFNULL(${Table.EMAIL}.threadId ,${Table.EMAIL}.id) as uniqueId, 
      GROUP_CONCAT(DISTINCT('L' || ${
        Table.EMAIL_LABEL
      }.labelId || 'L')) as myLabels
     FROM ${Table.EMAIL}
     JOIN ${Table.EMAIL_LABEL} ON ${Table.EMAIL}.id = ${
    Table.EMAIL_LABEL
  }.emailId
     WHERE unread = 1
     GROUP BY uniqueId
     ${havingClause}
  )`;

  const result = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT
  });

  return result[0].totalUnread;
};

const getTrashExpiredEmails = () => {
  const labelId = systemLabels.trash.id;
  const daysAgo = 30;

  return Email().findAll({
    include: [
      {
        model: EmailLabel(),
        where: {
          labelId
        }
      }
    ],
    where: {
      trashDate: {
        [Op.not]: null,
        [Op.lte]: moment()
          .subtract(daysAgo, 'days')
          .toDate()
      }
    }
  });
};

const updateEmail = ({
  id,
  key,
  threadId,
  date,
  unread,
  status,
  content,
  preview,
  unsentDate,
  messageId
}) => {
  const params = noNulls({
    key,
    threadId,
    date,
    unread: typeof unread === 'boolean' ? unread : undefined,
    status,
    content,
    preview,
    unsentDate,
    messageId
  });
  const whereParam = id ? { id } : { key };
  return Email().update(params, { where: whereParam });
};

const updateEmails = ({ ids, keys, unread, trashDate }, trx) => {
  const params = noNulls({
    unread: typeof unread === 'boolean' ? unread : undefined,
    trashDate
  });
  const { whereParamName, whereParamValue } = ids
    ? { whereParamName: 'id', whereParamValue: ids }
    : { whereParamName: 'key', whereParamValue: keys };

  return Email().update(params, {
    where: { [whereParamName]: whereParamValue },
    transaction: trx
  });
};

const updateUnreadEmailByThreadIds = ({ threadIds, unread }) => {
  const params = {};
  if (typeof unread === 'boolean') params.unread = unread;
  return Email().update(params, { where: { threadId: threadIds } });
};

/* EmailContact
----------------------------- */
const createEmailContact = (emailContacts, trx) => {
  return EmailContact().bulkCreate(emailContacts, { transaction: trx });
};

const deleteEmailContactByEmailId = (emailId, trx) => {
  return EmailContact().destroy({ where: { emailId }, transaction: trx });
};

const getContactsByEmailId = async emailId => {
  const emailContacts = await EmailContact().findAll({
    attributes: ['contactId', 'type'],
    where: { emailId }
  });

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

/* Label
----------------------------- */
const createLabel = async params => {
  let labelsToInsert;
  const isLabelArray = Array.isArray(params);
  if (isLabelArray) {
    labelsToInsert = params.map(labelParams => {
      if (!labelParams.uuid) {
        return Object.assign(labelParams, { uuid: genUUID() });
      }
      return labelParams;
    });
    return await Label().bulkCreate(labelsToInsert);
  }

  if (!params.uuid) {
    labelsToInsert = Object.assign(params, { uuid: genUUID() });
  }
  labelsToInsert = params;
  return Label().create(labelsToInsert);
};

const createSystemLabels = () => {
  const labels = Object.values(systemLabels);
  return createLabel(labels);
};

const deleteLabelById = async id => {
  return await getDB().transaction(async trx => {
    const ids = await EmailLabel()
      .findAll({
        attributes: ['id'],
        where: { labelId: id },
        raw: true,
        transaction: trx
      })
      .reduce((result, emailLabel) => {
        return [...result, emailLabel.id];
      }, []);
    if (ids.length)
      await EmailLabel().destroy({ where: { id: ids }, transaction: trx });
    return await Label().destroy({ where: { id }, transaction: trx });
  });
};

const getAllLabels = () => {
  return Label()
    .findAll()
    .map(label => label.toJSON());
};

const getLabelById = id => {
  return Label().findAll({ where: { id } });
};

const getLabelByUuid = uuid => {
  return Label()
    .findAll({ where: { uuid } })
    .map(label => label.toJSON());
};

const getLabelsByText = async textArray => {
  let labels = [];
  for (const text of textArray) {
    const labelsMatched = await Label()
      .findAll({
        where: { text: { [Op.like]: text } }
      })
      .map(label => label.toJSON());
    labels = labels.concat(labelsMatched);
  }
  return labels;
};

const updateLabel = ({ id, color, text, visible }) => {
  const params = {};
  if (color) params.color = color;
  if (text) params.text = text;
  if (typeof visible === 'boolean') params.visible = visible;
  return Label().update(params, { where: { id } });
};

/* EmailLabel
----------------------------- */
const createEmailLabel = (emailLabels, prevTrx) => {
  return createOrUseTrx(prevTrx, async trx => {
    const toInserts = await filterEmailLabelIfNotStore(emailLabels, trx);
    if (toInserts.length) {
      await filterEmailLabelTrashToUpdateEmail(toInserts, 'create', trx);
      return await EmailLabel().bulkCreate(toInserts, { transaction: trx });
    }
  });
};

const deleteEmailLabel = ({ emailIds, labelIds }, prevTrx) => {
  const emailLabels = emailIds.map(item => {
    return {
      emailId: item,
      labelId: labelIds[0]
    };
  });
  return createOrUseTrx(prevTrx, async trx => {
    await filterEmailLabelTrashToUpdateEmail(emailLabels, 'delete', trx);
    return await EmailLabel().destroy({
      where: { labelId: labelIds, emailId: emailIds },
      transaction: trx
    });
  });
};

const deleteEmailAndRelations = async (id, optionalEmailToSave) => {
  return await getDB().transaction(async trx => {
    await deleteEmailsByIds([id], trx);
    await deleteEmailContactByEmailId(id, trx);
    await deleteEmailLabelsByEmailId(id, trx);
    if (optionalEmailToSave) {
      const emailCreated = await createEmail(optionalEmailToSave, trx);
      return emailCreated.id;
    }
  });
};

const deleteEmailLabelsByEmailId = (emailId, trx) => {
  return EmailLabel().destroy({ where: { emailId }, transaction: trx });
};

const filterEmailLabelIfNotStore = async (emailLabels, trx) => {
  const emailIds = Array.from(new Set(emailLabels.map(item => item.emailId)));
  const labelIds = Array.from(new Set(emailLabels.map(item => item.labelId)));
  const stored = await EmailLabel().findAll({
    where: { emailId: emailIds, labelId: labelIds },
    transaction: trx
  });

  const storedEmailIds = stored.map(item => item.emailId);
  const storedLabelIds = stored.map(item => item.labelId);
  return emailLabels
    .map(item => {
      const isEmailIdStored = storedEmailIds.includes(item.emailId);
      const isLabelIdStored = storedLabelIds.includes(item.labelId);
      return isEmailIdStored && isLabelIdStored
        ? null
        : { emailId: Number(item.emailId), labelId: Number(item.labelId) };
    })
    .filter(item => item !== null);
};

const getEmailLabelsByEmailId = emailId => {
  return EmailLabel().findAll({
    attributes: ['labelId'],
    where: { emailId }
  });
};

/* File
----------------------------- */
const createFile = (files, trx) => {
  return File().bulkCreate(files, { transaction: trx });
};

const getFilesByEmailId = emailId => {
  return File().findAll({ where: { emailId } });
};

const getFilesByTokens = tokens => {
  return File()
    .findAll({ where: { token: tokens } })
    .map(file => file.toJSON());
};

const updateFilesByEmailId = ({ emailId, status }) => {
  const params = {};
  if (typeof status === 'number') params.status = status;
  return File().update(params, { where: { emailId } });
};

/* Feed Item
----------------------------- */
const createFeedItem = params => {
  return Feeditem().create(params);
};

const deleteFeedItemById = id => {
  return Feeditem().destroy({ where: { id } });
};

const getAllFeedItems = () => {
  return Feeditem()
    .findAll()
    .map(feeditem => feeditem.toJSON());
};

const getFeedItemsCounterBySeen = (seen = false) => {
  return Feeditem().count({
    where: { seen }
  });
};

const updateFeedItems = ({ ids, seen }) => {
  const params = {};
  if (typeof seen === 'boolean') params.seen = seen;
  return Feeditem().update(params, { where: { id: ids } });
};

/* Pending Event
----------------------------- */
const createPendingEvent = params => {
  return Pendingevent().create(params);
};

const getPendingEvents = () => {
  return Pendingevent()
    .findAll()
    .map(event => event.toJSON());
};

const deletePendingEventsByIds = ids => {
  return Pendingevent().destroy({ where: { id: ids } });
};

/* Settings
----------------------------- */
const createSettings = params => {
  return Settings().create(params);
};

const getSettings = () => {
  return Settings()
    .findOne()
    .then(setting => setting.toJSON());
};

const updateSettings = async ({
  language,
  opened,
  theme,
  autoBackupEnable,
  autoBackupFrequency,
  autoBackupLastDate,
  autoBackupLastSize,
  autoBackupNextDate,
  autoBackupPath
}) => {
  const params = noNulls({
    language,
    opened,
    theme,
    autoBackupEnable,
    autoBackupFrequency,
    autoBackupLastDate,
    autoBackupLastSize,
    autoBackupNextDate,
    autoBackupPath
  });
  if (Object.keys(params).length < 1) {
    return Promise.resolve([1]);
  }
  const result = await Settings().update(params, { where: { id: 1 } });
  mySettings.update(params);
  if (params.language) setLanguage(params.language);
  return result;
};

/* SessionRecord
----------------------------- */
const getSessionRecordByRecipientIds = recipientIds => {
  const sequelize = getDB();
  return Sessionrecord().findAll({
    attributes: [
      'recipientId',
      [sequelize.fn('GROUP_CONCAT', sequelize.col('deviceId')), 'deviceIds']
    ],
    where: { recipientId: recipientIds },
    group: ['recipientId'],
    raw: true
  });
};

/* Functions
----------------------------- */
const cleanDataBase = async () => {
  return await getDB().transaction(async trx => {
    await EmailContact().destroy({ where: {}, transaction: trx });
    await EmailLabel().destroy({ where: {}, transaction: trx });
    await Feeditem().destroy({ where: {}, transaction: trx });
    await Contact().destroy({ where: {}, transaction: trx });
    await Account().destroy({ where: {}, transaction: trx });
    await Email().destroy({ where: {}, transaction: trx });
    await Label().destroy({ where: { type: 'custom' }, transaction: trx });
    await File().destroy({ where: {}, transaction: trx });
    await Pendingevent().destroy({ where: {}, transaction: trx });
    await Settings().destroy({ where: {}, transaction: trx });
    await Prekeyrecord().destroy({ where: {}, transaction: trx });
    await Signedprekeyrecord().destroy({ where: {}, transaction: trx });
    await Sessionrecord().destroy({ where: {}, transaction: trx });
    await Identitykeyrecord().destroy({ where: {}, transaction: trx });
  });
};

const cleanDataLogout = async recipientId => {
  const params = {
    deviceId: '',
    jwt: '',
    refreshToken: ''
  };

  return await getDB().transaction(async trx => {
    await Account().update(params, {
      where: { recipientId },
      transaction: trx
    });
    await Prekeyrecord().destroy({ where: {}, transaction: trx });
    await Signedprekeyrecord().destroy({ where: {}, transaction: trx });
    await Sessionrecord().destroy({ where: {}, transaction: trx });
    await Identitykeyrecord().destroy({ where: {}, transaction: trx });
    await Settings().destroy({ where: {}, transaction: trx });
  });
};

const cleanKeys = async () => {
  if (!getDB()) return [];
  return await getDB().transaction(async trx => {
    await Prekeyrecord().destroy({ where: {}, transaction: trx });
    await Signedprekeyrecord().destroy({ where: {}, transaction: trx });
    await Sessionrecord().destroy({ where: {}, transaction: trx });
    await Identitykeyrecord().destroy({ where: {}, transaction: trx });
  });
};

const clearAndFormatDateEmails = emailObjOrArray => {
  let tempArr = [];
  const isAnEmailArray = Array.isArray(emailObjOrArray);
  const emailDateFormat = 'YYYY-MM-DD HH:mm:ss';
  if (!isAnEmailArray) {
    tempArr.push(emailObjOrArray);
  } else {
    tempArr = emailObjOrArray;
  }
  const formattedDateEmails = tempArr.map(email => {
    return noNulls({
      ...email,
      date: moment(email.date).format(emailDateFormat),
      trashDate: email.trashDate
        ? moment(email.trashDate).format(emailDateFormat)
        : null,
      unsentDate: email.unsentDate
        ? moment(email.unsentDate).format(emailDateFormat)
        : null
    });
  });
  return isAnEmailArray ? formattedDateEmails : formattedDateEmails[0];
};

const createOrUseTrx = (oldTrx, callback) => {
  if (oldTrx) return callback(oldTrx);
  return getDB().transaction(newTrx => callback(newTrx));
};

const filterEmailLabelTrashToUpdateEmail = async (emailLabels, action, trx) => {
  const ids = emailLabels
    .filter(emailLabel => emailLabel.labelId === systemLabels.trash.id)
    .map(item => item.emailId);
  if (ids.length) {
    const trashDate = action === 'create' ? getDB().fn('NOW') : '';
    await updateEmails({ ids, trashDate }, trx);
  }
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

const formStringSeparatedByOperator = (array, operator = ',') => {
  return array.reduce((result, item, index) => {
    if (index > 0) {
      return `${result}${operator} ${item}`;
    }
    return `${item}`;
  }, '');
};

const getContactsIdByType = (emailContacts, type) => {
  return emailContacts
    .filter(item => item.type === type)
    .map(item => item.contactId);
};

const InitDatabaseEncrypted = async ({
  key,
  shouldAddSystemLabels,
  shouldReset
}) => {
  await initDatabaseEncrypted({ key, shouldReset });
  if (shouldAddSystemLabels) await createSystemLabels();
};

module.exports = {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Identitykeyrecord,
  Label,
  Pendingevent,
  Prekeyrecord,
  Sessionrecord,
  Settings,
  Signedprekeyrecord,
  Table,
  Op,
  databasePath,
  cleanDataBase,
  cleanDataLogout,
  cleanKeys,
  createAccount,
  createContact,
  createContactsIfOrNotStore,
  createEmail,
  createEmailLabel,
  createFeedItem,
  createFile,
  createLabel,
  createPendingEvent,
  createSettings,
  deleteDatabase,
  deleteEmailsByIds,
  deleteEmailByKeys,
  deleteEmailLabel,
  deleteEmailAndRelations,
  deleteEmailsByThreadIdAndLabelId,
  deleteFeedItemById,
  deleteLabelById,
  deletePendingEventsByIds,
  filterEmailLabelIfNotStore,
  getDB,
  getAccount,
  getAccountByParams,
  getAllContacts,
  getAllLabels,
  getAllFeedItems,
  getContactByEmails,
  getContactByIds,
  getContactsByEmailId,
  getEmailByKey,
  getEmailLabelsByEmailId,
  getEmailsByArrayParam,
  getEmailsByIds,
  getEmailsByLabelIds,
  getEmailByParams,
  getEmailsByThreadId,
  getEmailsByThreadIdAndLabelId,
  getEmailsCounterByLabelId,
  getEmailsGroupByThreadByParams,
  getEmailsGroupByThreadByParamsToSearch,
  getEmailsToDeleteByThreadIdAndLabelId,
  getEmailsUnredByLabelId,
  getFeedItemsCounterBySeen,
  getFilesByEmailId,
  getFilesByTokens,
  getLabelById,
  getLabelByUuid,
  getLabelsByText,
  getPendingEvents,
  getSessionRecordByRecipientIds,
  getSettings,
  getTrashExpiredEmails,
  initDatabaseEncrypted: InitDatabaseEncrypted,
  resetKeyDatabase,
  updateAccount,
  updateContactByEmail,
  updateContactSpamScore,
  updateEmail,
  updateEmails,
  updateFeedItems,
  updateFilesByEmailId,
  updateLabel,
  updateSettings,
  updateUnreadEmailByThreadIds
};
