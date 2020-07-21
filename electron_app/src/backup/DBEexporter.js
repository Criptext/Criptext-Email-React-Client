const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');
const globalManager = {};
const moment = require('moment');
const {
  AccountContact,
  Alias,
  Contact,
  CustomDomain,
  Email,
  Label,
  getDB,
  Table,
  getSettings,
} = require('../database/DBEmanager');
const systemLabels = require('./../systemLabels');
/*const { APP_DOMAIN, LINK_DEVICES_FILE_VERSION } = require('../utils/const');
const {
  getEmailBody,
  getEmailHeaders
} = require('../utils/FileUtils');
const { getShowPreview } = require('../windows/mailbox');*/

const CIPHER_ALGORITHM = 'aes-128-cbc';
const STREAM_SIZE = 512 * 1024;

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
    const result = await Contact().findAll({
      attributes: ['id', 'email', 'name', 'isTrusted', 'spamScore'],
      include: [
        {
          attributes: [],
          model: AccountContact(),
          where: { accountId }
        }
      ],
      offset,
      limit: SELECT_ALL_BATCH
    });
    contactRows = [...contactRows, ...result];
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

const exportEmailTable = async (accountId, email) => {
  let emailRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await getDB()
      .query(
        `SELECT content, date, fromAddress, email.id, key, messageId, preview, 
        replyTo, secure, status, subject, threadId, unread, unsentDate 
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

          const body =
            (await getEmailBody({
              username: email,
              metadataKey: newRow.key,
              password: globalManager.databaseKey.get()
            })) ||
            newRow.content ||
            '';
          const headers = await getEmailHeaders({
            username: email,
            metadataKey: newRow.key,
            password: globalManager.databaseKey.get()
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
    progress: parseInt(progress),
    message,
    email
  });
};

const exportEncryptDatabaseToFile = async ({
  outputPath,
  accountObj,
  progressCallback
}) => {
  console.log('DB : ', getDB());
  return;
  const filepath = outputPath;
  const PROGRESS_TOTAL_STEPS = 19;
  let exportProgress = 0;

  const [recipientId, domain] = accountObj
    ? accountObj.recipientId.split('@')
    : myAccount.recipientId.split('@');
  const accountEmail = `${recipientId}@${domain || APP_DOMAIN}`;
  const accountId = accountObj ? accountObj.id : myAccount.id;
  const signature =
    accountObj && accountObj.signature !== undefined
      ? accountObj.signature
      : myAccount.signature;

  const hasCriptextFooter =
    accountObj && accountObj.signFooter !== undefined
      ? accountObj.signFooter
      : myAccount.signFooter;
  const showPreview = await getShowPreview();

  const { language, theme } = await getSettings();

  const fileInformation = JSON.stringify({
    fileVersion: LINK_DEVICES_FILE_VERSION,
    recipientId: recipientId,
    domain: domain || APP_DOMAIN,
    signature: signature,
    hasCriptextFooter: hasCriptextFooter,
    language: language,
    darkTheme: theme === 'dark',
    showPreview: showPreview
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
      `${recipientId}@${domain || APP_DOMAIN}`,
      progressCallback
    );

    const result = await exportTable.export(accountId, accountEmail);

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

const encryptStreamFile = ({ inputFile, outputFile, key, iv, salt }) => {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(inputFile, {
      highWaterMark: STREAM_SIZE
    });
    const writer = fs.createWriteStream(outputFile);
    if (salt) writer.write(salt);
    writer.write(iv);

    reader
      .pipe(zlib.createGzip())
      .pipe(crypto.createCipheriv(CIPHER_ALGORITHM, key, iv))
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
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

module.exports = {
  encryptStreamFile,
  exportContactTable,
  exportEmailTable,
  exportEmailContactTable,
  exportEmailLabelTable,
  exportEncryptDatabaseToFile,
  exportFileTable,
  exportLabelTable
};