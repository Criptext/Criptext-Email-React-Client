const fs = require('fs');
const moment = require('moment');
const {
  Alias,
  CustomDomain,
  Email,
  Label,
  getDB,
  Table,
  getSettings
} = require('../database/DBEmanager');
const systemLabels = require('./../systemLabels');
const { APP_DOMAIN, LINK_DEVICES_FILE_VERSION } = require('../utils/const');
const { getEmailBody, getEmailHeaders } = require('../utils/FileUtils');

const excludedEmailStatus = [1, 4];
const excludedLabels = [systemLabels.draft.id];
const whereRawEmailQuery = (id, accountId) => `INNER JOIN ${Table.EMAIL_LABEL} 
    ON ${id} = ${Table.EMAIL_LABEL}.emailId 
    WHERE ${Table.EMAIL}.accountId=${accountId} 
    AND ${Table.EMAIL_LABEL}.labelId NOT IN (${excludedLabels.join(',')}) 
    AND ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')})
`;

/* Batches
----------------------------- */
const SELECT_ALL_BATCH = 500;

const exportContactTable = async accountId => {
  let contactRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const [result] = await getDB().query(
      `SELECT ${Table.CONTACT}.* FROM ${Table.CONTACT}, ${
        Table.ACCOUNT_CONTACT
      } WHERE ${Table.CONTACT}.id == ${Table.ACCOUNT_CONTACT}.contactId 
        AND ${
          Table.ACCOUNT_CONTACT
        }.accountId = ${accountId} LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset};`
    );
    contactRows = [
      ...contactRows,
      ...result.map(row => {
        return {
          ...row,
          isTrusted: !!row.isTrusted
        };
      })
    ];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.CONTACT, contactRows);
};

const exportLabelTable = async accountId => {
  let labelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await Label().findAll({
      attributes: ['id', 'text', 'color', 'type', 'visible', 'uuid'],
      where: { type: 'custom', accountId },
      offset,
      limit: SELECT_ALL_BATCH
    });
    labelRows = [...labelRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.LABEL, labelRows);
};

const exportEmailTable = async (accountId, email, databaseKey) => {
  let emailRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await getDB()
      .query(
        `SELECT content, date, fromAddress, email.id, key, messageId, preview, 
        replyTo, secure, status, subject, threadId, unread, unsentDate, isNewsletter 
        FROM ${Table.EMAIL} ${whereRawEmailQuery(
          `${Table.EMAIL}.id`,
          accountId
        )}
      GROUP BY ${Table.EMAIL}.id
      LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`,
        {
          model: Email(),
          mapToModel: true
        }
      )
      .then(async rows => {
        const emailRows = [];

        for (const emailRow of rows) {
          let newRow = emailRow.toJSON();
          if (!newRow.unsentDate) delete newRow.unsentDate;
          if (!newRow.trashDate) delete newRow.trashDate;
          if (newRow.replyTo === null) newRow = { ...newRow, replyTo: '' };
          if (!newRow.boundary) delete newRow.boundary;
          if (!newRow.isNewsletter) delete newRow.isNewsletter;

          const body =
            (await getEmailBody({
              username: email,
              metadataKey: newRow.key,
              password: databaseKey
            })) ||
            newRow.content ||
            '';
          await sleep(5);
          const headers = await getEmailHeaders({
            username: email,
            metadataKey: newRow.key,
            password: databaseKey
          });
          const key = parseInt(newRow.key);
          emailRows.push({
            ...newRow,
            content: body,
            key,
            date: parseOutgoingDate(newRow.date),
            headers: headers || undefined
          });
        }
        return emailRows;
      });
    emailRows = [...emailRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
    await sleep(5);
  }
  return formatTableRowsToString(Table.EMAIL, emailRows);
};

const exportEmailContactTable = async accountId => {
  let emailContactRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await getDB()
      .query(
        `SELECT emailContact.* FROM ${Table.EMAIL_CONTACT} INNER JOIN ${
          Table.EMAIL
        } ON ${Table.EMAIL}.id=${
          Table.EMAIL_CONTACT
        }.emailId ${whereRawEmailQuery(
          `${Table.EMAIL_CONTACT}.emailId`,
          accountId
        )}
        GROUP BY ${Table.EMAIL_CONTACT}.id
        LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`,
        { type: getDB().QueryTypes.SELECT }
      )
      .then(rows => {
        return rows.map(row => {
          return Object.assign(row, {
            emailId: parseInt(row.emailId)
          });
        });
      });

    emailContactRows = [...emailContactRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString('email_contact', emailContactRows);
};

const exportEmailLabelTable = async accountId => {
  let emailLabelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await getDB()
      .query(
        `SELECT emailLabel.* FROM ${Table.EMAIL_LABEL} INNER JOIN ${
          Table.EMAIL
        } ON ${Table.EMAIL}.id=${Table.EMAIL_LABEL}.emailId 
        WHERE ${Table.EMAIL_LABEL}.labelId NOT IN (${excludedLabels.join(',')})
        AND ${Table.EMAIL}.accountId = ${accountId}
        AND ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')})
        AND ${Table.EMAIL_LABEL}.emailId IS NOT NULL
        AND ${Table.EMAIL_LABEL}.labelId IS NOT NULL
        GROUP BY ${Table.EMAIL_LABEL}.id
        LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`,
        { type: getDB().QueryTypes.SELECT }
      )
      .then(rows => {
        return rows.map(row => {
          return Object.assign(row, {
            emailId: parseInt(row.emailId)
          });
        });
      });

    emailLabelRows = [...emailLabelRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString('email_label', emailLabelRows);
};

const exportFileTable = async accountId => {
  let fileRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await getDB()
      .query(
        `SELECT file.* FROM ${Table.FILE} INNER JOIN ${Table.EMAIL} ON ${
          Table.EMAIL
        }.id=${Table.FILE}.emailId ${whereRawEmailQuery(
          `${Table.FILE}.emailId`,
          accountId
        )}
        GROUP BY ${Table.FILE}.id
        LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`,
        { type: getDB().QueryTypes.SELECT }
      )
      .then(rows => {
        return rows.map(row => {
          if (!row.cid) delete row.cid;
          return Object.assign(row, {
            emailId: parseInt(row.emailId),
            date: parseOutgoingDate(row.date)
          });
        });
      });

    fileRows = [...fileRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.FILE, fileRows);
};

const exportAliasTable = async accountId => {
  let aliasRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await Alias()
      .findAll({
        attributes: ['id', 'rowId', 'name', 'domain', 'active'],
        where: { accountId },
        offset,
        limit: SELECT_ALL_BATCH
      })
      .then(rows => {
        return rows.map(row => {
          const myRow = row.toJSON();
          if (!myRow.domain) delete myRow.domain;
          return myRow;
        });
      });
    aliasRows = [...aliasRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.ALIAS, aliasRows);
};

const exportCustomDomainsTable = async accountId => {
  let customDomainsRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await CustomDomain()
      .findAll({
        attributes: ['id', 'name', 'validated'],
        where: { accountId },
        offset,
        limit: SELECT_ALL_BATCH
      })
      .then(rows => {
        return rows.map(row => row.toJSON());
      });
    customDomainsRows = [...customDomainsRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.CUSTOM_DOMAIN, customDomainsRows);
};

const handleProgressCallback = (progress, message, email, progressCallback) => {
  if (!progressCallback) return;
  progressCallback({
    step: 'progress',
    progress: parseInt(progress),
    message,
    email
  });
};

const exportEncryptDatabaseToFile = async ({
  outputPath,
  accountObj,
  progressCallback,
  databaseKey
}) => {
  const filepath = outputPath;
  const PROGRESS_TOTAL_STEPS = 19;
  let exportProgress = 0;

  const recipientId = accountObj.recipientId;
  const domain = accountObj.domain;
  const accountEmail = accountObj.email;
  const accountId = accountObj.id;
  const signature = '';

  const hasCriptextFooter = false;

  const { language, theme } = await getSettings();

  const fileInformation = JSON.stringify({
    fileVersion: LINK_DEVICES_FILE_VERSION,
    recipientId: recipientId,
    domain: domain || APP_DOMAIN,
    signature: signature,
    hasCriptextFooter: hasCriptextFooter,
    language: language,
    darkTheme: theme === 'dark',
    showPreview: false
  });

  exportProgress += 100 / PROGRESS_TOTAL_STEPS;
  handleProgressCallback(
    exportProgress,
    'saving_account',
    accountEmail,
    progressCallback
  );

  await saveToFile({ data: fileInformation, filepath, mode: 'w' }, true);

  const exportTables = [
    {
      export: exportContactTable,
      suffix: 'contacts'
    },
    {
      export: exportLabelTable,
      suffix: 'labels'
    },
    {
      export: exportEmailTable,
      suffix: 'emails'
    },
    {
      export: exportEmailContactTable,
      suffix: 'email_contacts'
    },
    {
      export: exportEmailLabelTable,
      suffix: 'email_labels'
    },
    {
      export: exportFileTable,
      suffix: 'files'
    },
    {
      export: exportAliasTable,
      suffix: 'aliases'
    },
    {
      export: exportCustomDomainsTable,
      suffix: 'domains'
    }
  ];

  for (const exportTable of exportTables) {
    exportProgress += 100 / PROGRESS_TOTAL_STEPS;
    handleProgressCallback(
      exportProgress,
      `exporting_${exportTable.suffix}`,
      accountEmail,
      progressCallback
    );

    const result = await exportTable.export(
      accountId,
      accountEmail,
      databaseKey
    );

    exportProgress += 100 / PROGRESS_TOTAL_STEPS;
    handleProgressCallback(
      exportProgress,
      `saving_${exportTable.suffix}`,
      accountEmail,
      progressCallback
    );

    await saveToFile({ data: result, filepath, mode: 'a' });
  }

  exportProgress = 99;
  handleProgressCallback(
    exportProgress,
    'almost_done',
    accountEmail,
    progressCallback
  );
};

const formatTableRowsToString = (tableName, rowsObject) => {
  return rowsObject
    .map(row => JSON.stringify({ table: tableName, object: row }))
    .join('\n');
};

const parseOutgoingDate = date => {
  return moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
};

const saveToFile = ({ data, filepath, mode }, isFirstRecord) => {
  const flag = mode || 'w';
  if (data.length <= 0) {
    return;
  }
  return new Promise((resolve, reject) => {
    const dataToWrite = isFirstRecord ? data : '\n' + data;
    fs.writeFile(filepath, dataToWrite, { encoding: 'utf-8', flag }, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const sleep = time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

module.exports = {
  exportContactTable,
  exportEmailTable,
  exportEmailContactTable,
  exportEmailLabelTable,
  exportEncryptDatabaseToFile,
  exportFileTable,
  exportLabelTable
};
