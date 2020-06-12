const fs = require('fs');
const zlib = require('zlib');
const knex = require('knex');
const crypto = require('crypto');
const LineByLineReader = require('line-by-line');
const globalManager = require('../globalManager');
const moment = require('moment');
const {
  Account,
  AccountContact,
  Alias,
  Contact,
  CustomDomain,
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
  getDB,
  Table,
  deleteAccountNotSignalRelatedData,
  getSettings,
  updateSettings,
  updateAccount
} = require('./DBEmanager');
const myAccount = require('./../Account');
const systemLabels = require('./../systemLabels');
const { APP_DOMAIN, LINK_DEVICES_FILE_VERSION } = require('../utils/const');
const {
  getEmailBody,
  getEmailHeaders,
  removeEmailsCopy,
  replaceEmailsWithCopy,
  saveEmailBody
} = require('./../utils/FileUtils');
const { getShowPreview, setShowPreview } = require('../windows/mailbox');

const CIPHER_ALGORITHM = 'aes-128-cbc';
const STREAM_SIZE = 512 * 1024;
const DEFAULT_KEY_LENGTH = 16;

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
const CONTACTS_BATCH = 500;
const EMAIL_CONTACTS_BATCH = 500;
const EMAIL_LABELS_BATCH = 500;
const EMAILS_BATCH = 100;
const FEEDITEM_BATCH = 100;
const FILES_BATCH = 200;
const ALIAS_BATCH = 50;
const CUSTOM_DOMAINS_BATCH = 50;
const IDENTITYKEYRECORD_BATCH = 50;
const LABELS_BATCH = 50;
const PENDINGEVENT_BATCH = 50;
const PREKEYRECORD_BATCH = 50;
const SELECT_ALL_BATCH = 500;
const SESSIONRECORD_BATCH = 50;
const SIGNEDPREKEYRECORD_BATCH = 50;

/* Not Encrypted Database
----------------------------- */
const createNotEncryptDatabaseConnection = dbPath => {
  const dbConfiguration = {
    client: 'sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true
  };
  return knex(dbConfiguration);
};

const exportNotEncryptDatabaseToFile = async ({ databasePath, outputPath }) => {
  const filepath = outputPath;
  const dbConn = await createNotEncryptDatabaseConnection(databasePath);
  const accountsData = await _exportAccountTable(dbConn);
  globalManager.progressDBE.set({ add: 1 });
  await saveToFile(
    { data: accountsData.rowsString, filepath, mode: 'w' },
    true
  );
  const contacts = await _exportContactTable(dbConn);
  await saveToFile({ data: contacts, filepath, mode: 'a' });
  const labels = await _exportLabelTable(dbConn);
  await saveToFile({ data: labels, filepath, mode: 'a' });

  let userEmail;
  if (myAccount && myAccount.recipientId) {
    userEmail = myAccount.email;
  } else {
    const firstAccount = accountsData.firstAccount;
    userEmail = firstAccount.recipientId.includes('@')
      ? firstAccount.recipientId
      : `${firstAccount.recipientId}@${APP_DOMAIN}`;
  }
  const emails = await _exportEmailTable(dbConn, userEmail);
  await saveToFile({ data: emails, filepath, mode: 'a' });
  const emailContacts = await _exportEmailContactTable(dbConn);
  await saveToFile({ data: emailContacts, filepath, mode: 'a' });
  const emailLabels = await _exportEmailLabelTable(dbConn);
  await saveToFile({ data: emailLabels, filepath, mode: 'a' });
  const feeditems = await _exportFeedItemTable(dbConn);
  await saveToFile({ data: feeditems, filepath, mode: 'a' });
  const files = await _exportFileTable(dbConn);
  await saveToFile({ data: files, filepath, mode: 'a' });
  const identities = await _exportIdentitykeyrecordTable(dbConn);
  await saveToFile({ data: identities, filepath, mode: 'a' });
  const pendingevents = await _exportPendingeventTable(dbConn);
  await saveToFile({ data: pendingevents, filepath, mode: 'a' });
  const prekeyrecords = await _exportPrekeyrecordTable(dbConn);
  await saveToFile({ data: prekeyrecords, filepath, mode: 'a' });
  const sessionrecords = await _exportSessionrecordTable(dbConn);
  await saveToFile({ data: sessionrecords, filepath, mode: 'a' });
  const settings = await _exportSettingsTable(dbConn);
  await saveToFile({ data: settings, filepath, mode: 'a' });
  const signedprekeyrecords = await _exportSignedprekeyrecordTable(dbConn);
  await saveToFile({ data: signedprekeyrecords, filepath, mode: 'a' });

  await closeDatabaseConnection(dbConn);
};

const _exportAccountTable = async db => {
  let accountRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT * FROM ${
          Table.ACCOUNT
        } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => {
          return Object.assign(row, {
            signFooter: !!row.signFooter,
            encryptToExternals: !!row.encryptToExternals,
            signatureEnabled: !!row.signatureEnabled
          });
        })
      );
    accountRows = [...accountRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return {
    rowsString: formatTableRowsToString(Table.ACCOUNT, accountRows),
    firstAccount: accountRows[0]
  };
};

const _exportContactTable = async db => {
  let contactRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT * FROM ${
          Table.CONTACT
        } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => {
          if (!row.name) delete row.name;
          return Object.assign(row, {
            isTrusted: !!row.isTrusted
          });
        })
      );
    contactRows = [...contactRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.CONTACT, contactRows);
};

const _exportLabelTable = async db => {
  let labelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT * FROM ${
          Table.LABEL
        } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => Object.assign(row, { visible: !!row.visible }))
      );
    labelRows = [...labelRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.LABEL, labelRows);
};

const _exportEmailTable = async (db, userEmail) => {
  let emailRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const rows = await db.raw(
      `SELECT email.* FROM ${Table.EMAIL}
      WHERE ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')})
      GROUP BY ${Table.EMAIL}.id
      LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
    );
    const result = await Promise.all(
      rows.map(async row => {
        if (!row.unsendDate) {
          delete row.unsendDate;
        } else {
          row['unsentDate'] = parseOutgoingDate(row.unsendDate);
          delete row.unsendDate;
        }

        if (!row.trashDate) {
          delete row.trashDate;
        } else {
          row['trashDate'] = parseOutgoingDate(row.trashDate);
        }

        if (row.replyTo === null) {
          row.replyTo = '';
        }

        if (!row.boundary) {
          delete row.boundary;
        }

        const body = await getEmailBody({
          username: userEmail,
          metadataKey: row.key
        });
        const headers = await getEmailHeaders({
          username: userEmail,
          metadataKey: row.key
        });
        const key = parseInt(row.key);
        return Object.assign(row, {
          unread: !!row.unread,
          secure: !!row.secure,
          content: body,
          headers: headers,
          key,
          date: parseOutgoingDate(row.date)
        });
      })
    );

    emailRows = [...emailRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.EMAIL, emailRows);
};

const _exportEmailContactTable = async db => {
  let emailContactRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT emailContact.* FROM ${Table.EMAIL_CONTACT} INNER JOIN ${
          Table.EMAIL
        } ON ${Table.EMAIL}.id=${Table.EMAIL_CONTACT}.emailId 
        WHERE ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')})
        GROUP BY ${Table.EMAIL_CONTACT}.id
        LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => {
          return Object.assign(row, {
            emailId: parseInt(row.emailId)
          });
        })
      );
    emailContactRows = [...emailContactRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString('email_contact', emailContactRows);
};

const _exportEmailLabelTable = async db => {
  let emailLabelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT emailLabel.* FROM ${Table.EMAIL_LABEL} INNER JOIN ${
          Table.EMAIL
        } ON ${Table.EMAIL}.id=${Table.EMAIL_LABEL}.emailId 
        WHERE ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')})
        GROUP BY ${Table.EMAIL_LABEL}.id
        LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row =>
          Object.assign(row, {
            emailId: parseInt(row.emailId)
          })
        )
      );
    emailLabelRows = [...emailLabelRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString('email_label', emailLabelRows);
};

const _exportFeedItemTable = async db => {
  let feeditemstRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT * FROM ${
          Table.FEEDITEM
        } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => {
          return Object.assign(row, {
            seen: !!row.seen
          });
        })
      );
    feeditemstRows = [...feeditemstRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.FEEDITEM, feeditemstRows);
};

const _exportFileTable = async db => {
  let fileRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT file.* FROM ${Table.FILE} INNER JOIN ${Table.EMAIL} ON ${
          Table.EMAIL
        }.id=${Table.FILE}.emailId
        WHERE ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')})
        GROUP BY ${Table.FILE}.id
        LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => {
          if (!row.cid) {
            delete row.cid;
          }

          return Object.assign(row, {
            readOnly: !!row.readOnly,
            emailId: parseInt(row.emailId),
            date: parseOutgoingDate(row.date)
          });
        })
      );
    fileRows = [...fileRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.FILE, fileRows);
};

const _exportIdentitykeyrecordTable = async db => {
  let identitiesRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db.raw(
      `SELECT * FROM ${
        Table.IDENTITYKEYRECORD
      } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
    );
    identitiesRows = [...identitiesRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.IDENTITYKEYRECORD, identitiesRows);
};

const _exportPendingeventTable = async db => {
  let pendingeventsRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db.raw(
      `SELECT * FROM ${
        Table.PENDINGEVENT
      } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
    );
    pendingeventsRows = [...pendingeventsRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.PENDINGEVENT, pendingeventsRows);
};

const _exportPrekeyrecordTable = async db => {
  let prekeyrecordsRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db.raw(
      `SELECT * FROM ${
        Table.PREKEYRECORD
      } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
    );
    prekeyrecordsRows = [...prekeyrecordsRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.PREKEYRECORD, prekeyrecordsRows);
};

const _exportSessionrecordTable = async db => {
  let sessionrecordsRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db.raw(
      `SELECT * FROM ${
        Table.SESSIONRECORD
      } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
    );
    sessionrecordsRows = [...sessionrecordsRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.SESSIONRECORD, sessionrecordsRows);
};

const _exportSettingsTable = async db => {
  let settingRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT * FROM ${
          Table.SETTINGS
        } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => {
          return Object.assign(row, {
            opened: !!row.opened,
            autoBackupEnable: !!row.autoBackupEnable
          });
        })
      );
    settingRows = [...settingRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(Table.SETTINGS, settingRows);
};

const _exportSignedprekeyrecordTable = async db => {
  let signedprekeyrecordRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db.raw(
      `SELECT * FROM ${
        Table.SIGNEDPREKEYRECORD
      } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
    );
    signedprekeyrecordRows = [...signedprekeyrecordRows, ...result];
    if (result.length < SELECT_ALL_BATCH) {
      shouldEnd = true;
    } else {
      offset += SELECT_ALL_BATCH;
    }
  }
  return formatTableRowsToString(
    Table.SIGNEDPREKEYRECORD,
    signedprekeyrecordRows
  );
};

const closeDatabaseConnection = async dbConnection => {
  await dbConnection.destroy();
};

/* Encrypted Database
----------------------------- */
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

const exportEmailTable = async accountId => {
  const username = myAccount.email;
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
              username,
              metadataKey: newRow.key,
              password: globalManager.databaseKey.get()
            })) ||
            newRow.content ||
            '';
          const headers = await getEmailHeaders({
            username,
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
  const filepath = outputPath;
  const PROGRESS_TOTAL_STEPS = 19;
  let exportProgress = 0;

  const [recipientId, domain] = accountObj
    ? accountObj.recipientId.split('@')
    : myAccount.recipientId.split('@');
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
    `${recipientId}@${domain || APP_DOMAIN}`,
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

    const result = await exportTable.export(accountId);

    exportProgress += 100 / PROGRESS_TOTAL_STEPS;
    handleProgressCallback(
      exportProgress,
      `saving_${exportTable.suffix}`,
      `${recipientId}@${domain || APP_DOMAIN}`,
      progressCallback
    );

    await saveToFile({ data: result, filepath, mode: 'a' });
  }

  exportProgress = 99;
  handleProgressCallback(
    exportProgress,
    'almost_done',
    `${recipientId}@${domain || APP_DOMAIN}`,
    progressCallback
  );
};

const importDatabaseFromFile = async ({
  filepath,
  isStrict,
  withoutBodiesEncryption,
  accountObj = {}
}) => {
  let contacts = [];
  let labels = [];
  let emails = [];
  let emailContacts = [];
  let emailLabels = [];
  let feeditems = [];
  let files = [];
  let identities = [];
  let pendingevents = [];
  let prekeyrecords = [];
  let sessionrecords = [];
  let settings = [];
  let signedprekeyrecords = [];
  let aliases = [];
  let customDomains = [];
  // eslint-disable-next-line prefer-const
  let accountObject = {};
  // eslint-disable-next-line prefer-const
  let settingsObject = {};

  const sequelize = getDB();

  return await sequelize.transaction(async trx => {
    let accountId = accountObj.id;
    let userEmail = accountObj.email;
    if (!accountId && !userEmail && myAccount.recipientId) {
      userEmail = myAccount.email;
      accountId = myAccount.id;
    }

    if (isStrict) {
      getCustomLinesByStream(filepath, 1, async (err, lines) => {
        if (err) throw new Error('Failed to read file information');
        const fileInformation = lines[0];
        const {
          fileVersion,
          recipientId,
          domain,
          signature,
          hasCriptextFooter,
          language,
          darkTheme,
          showPreview
        } = JSON.parse(fileInformation);

        if (recipientId && domain) {
          const fileOwner = `${recipientId}@${domain}`;
          const currentAddress = myAccount.email;
          if (fileOwner !== currentAddress) return;
        }
        if (fileVersion) {
          const version = Number(fileVersion);
          const currentVersion = Number(LINK_DEVICES_FILE_VERSION);
          if (version !== currentVersion) return;
        }

        if (signature !== undefined) {
          accountObject.signature = signature;
        }

        if (hasCriptextFooter !== undefined) {
          accountObject.signFooter = hasCriptextFooter;
        }

        if (language) {
          settingsObject.language = language;
        }

        if (darkTheme !== undefined) {
          settingsObject.theme = darkTheme ? 'dark' : 'light';
        }

        if (showPreview !== undefined) {
          await setShowPreview(showPreview);
        }
        if (Object.keys(settingsObject).length !== 0) {
          await updateSettings(settingsObject, trx);
        }
        if (Object.keys(accountObj).length !== 0) {
          await updateAccount(accountObj, trx);
        }
      });

      if (accountId) {
        await deleteAccountNotSignalRelatedData(accountId, trx);
      }
    }

    let labelIdsMap = {
      1: 1,
      2: 2,
      3: 3,
      5: 5,
      6: 6,
      7: 7
    };
    let labelUuidToId = {};

    let emailIdsMap = {};
    let emailKeysToId = {};

    let contactEmailToId = {};
    let contactIdsMap = {};

    let lastTableRow;
    let insertRows = false;

    const lineReader = new LineByLineReader(filepath);
    return new Promise((resolve, reject) => {
      lineReader
        .on('line', async line => {
          const { table, object } = JSON.parse(line);
          if (table === Table.ACCOUNT) {
            globalManager.progressDBE.set({ add: 1 });
          }
          try {
            lineReader.pause();
            if (lastTableRow !== table || insertRows) {
              switch (lastTableRow) {
                case Table.CONTACT: {
                  const idsMap = await insertContacts(
                    contacts,
                    contactEmailToId,
                    trx
                  );
                  await insertAccountContacts(
                    Object.values(idsMap),
                    accountId,
                    trx
                  );
                  contactIdsMap = { ...contactIdsMap, ...idsMap };
                  contacts = [];
                  contactEmailToId = {};
                  break;
                }
                case Table.LABEL: {
                  const idsMap = await insertLabels(labels, labelUuidToId, trx);
                  labelIdsMap = { ...labelIdsMap, ...idsMap };
                  labelUuidToId = {};
                  labels = [];
                  break;
                }
                case Table.EMAIL: {
                  await storeEmailBodies(
                    emails,
                    userEmail,
                    withoutBodiesEncryption
                  );
                  const idsMap = await insertEmails(emails, emailKeysToId, trx);
                  emailIdsMap = { ...emailIdsMap, ...idsMap };
                  emails = [];
                  emailKeysToId = {};
                  break;
                }
                case 'email_contact': {
                  await EmailContact().bulkCreate(emailContacts, {
                    transaction: trx
                  });
                  emailContacts = [];
                  break;
                }
                case 'email_label': {
                  await EmailLabel().bulkCreate(emailLabels, {
                    transaction: trx
                  });
                  emailLabels = [];
                  break;
                }
                case Table.FEEDITEM: {
                  try {
                    await Feeditem().bulkCreate(feeditems, {
                      transaction: trx
                    });
                    feeditems = [];
                  } catch (error) {
                    console.log(`${Table.FEEDITEM}`, error);
                  }
                  break;
                }
                case Table.FILE: {
                  await File().bulkCreate(files, { transaction: trx });
                  files = [];
                  break;
                }
                case Table.ALIAS: {
                  await Alias().bulkCreate(aliases, { transaction: trx });
                  aliases = [];
                  break;
                }
                case Table.CUSTOM_DOMAIN: {
                  await CustomDomain().bulkCreate(customDomains, {
                    transaction: trx
                  });
                  customDomains = [];
                  break;
                }
                case Table.IDENTITYKEYRECORD: {
                  await Identitykeyrecord().bulkCreate(identities, {
                    transaction: trx
                  });
                  identities = [];
                  break;
                }
                case Table.PENDINGEVENT: {
                  await Pendingevent().bulkCreate(pendingevents, {
                    transaction: trx
                  });
                  pendingevents = [];
                  break;
                }
                case Table.PREKEYRECORD: {
                  await Prekeyrecord().bulkCreate(prekeyrecords, {
                    transaction: trx
                  });
                  prekeyrecords = [];
                  break;
                }
                case Table.SESSIONRECORD: {
                  await Sessionrecord().bulkCreate(sessionrecords, {
                    transaction: trx
                  });
                  sessionrecords = [];
                  break;
                }
                case Table.SIGNEDPREKEYRECORD: {
                  await Signedprekeyrecord().bulkCreate(signedprekeyrecords, {
                    transaction: trx
                  });
                  signedprekeyrecords = [];
                  break;
                }
                default:
                  break;
              }
            }

            switch (table) {
              case Table.ACCOUNT: {
                const account = await Account()
                  .create(object, { transaction: trx })
                  .then(account => account.toJSON());
                if (!userEmail) {
                  userEmail = object.recipientId.includes('@')
                    ? object.recipientId
                    : `${object.recipientId}@${APP_DOMAIN}`;
                }
                if (!accountId) {
                  accountId = account.id;
                }
                insertRows = false;
                break;
              }
              case Table.CONTACT: {
                contactEmailToId[object.email] = object.id;
                delete object.id;
                contacts.push(object);
                insertRows = contacts.length > CONTACTS_BATCH;
                break;
              }
              case Table.LABEL: {
                labelUuidToId[object.uuid] = object.id;
                delete object.id;
                labels.push({
                  ...object,
                  accountId
                });
                insertRows = labels.length > LABELS_BATCH;
                break;
              }
              case Table.EMAIL: {
                const emailToStore = {
                  ...object,
                  date: parseIncomingDate(object.date),
                  accountId
                };
                delete emailToStore.id;
                emailKeysToId[object.key] = object.id;
                emails.push(emailToStore);
                insertRows = emails.length > EMAILS_BATCH;
                break;
              }
              case 'email_contact': {
                delete object.id;
                emailContacts.push({
                  ...object,
                  emailId: emailIdsMap[object.emailId],
                  contactId: contactIdsMap[object.contactId]
                });
                insertRows = emailContacts.length > EMAIL_CONTACTS_BATCH;
                break;
              }
              case 'email_label': {
                delete object.id;
                emailLabels.push({
                  ...object,
                  emailId: emailIdsMap[object.emailId],
                  labelId: labelIdsMap[object.labelId]
                });
                insertRows = emailLabels.length > EMAIL_LABELS_BATCH;
                break;
              }
              case Table.FEEDITEM: {
                delete object.id;
                feeditems.push({
                  ...object,
                  emailId: emailIdsMap[object.emailId],
                  contactId: contactIdsMap[object.contactId],
                  accountId
                });
                insertRows = feeditems.length > FEEDITEM_BATCH;
                break;
              }
              case Table.FILE: {
                delete object.id;
                files.push({
                  ...object,
                  emailId: emailIdsMap[object.emailId]
                });
                insertRows = files.length > FILES_BATCH;
                break;
              }
              case Table.ALIAS: {
                delete object.id;
                aliases.push({
                  ...object,
                  accountId
                });
                insertRows = aliases.length > ALIAS_BATCH;
                break;
              }
              case Table.CUSTOM_DOMAIN: {
                delete object.id;
                customDomains.push({
                  ...object,
                  accountId
                });
                insertRows = customDomains.length > CUSTOM_DOMAINS_BATCH;
                break;
              }
              case Table.IDENTITYKEYRECORD: {
                identities.push({
                  ...object,
                  accountId
                });
                insertRows = identities.length > IDENTITYKEYRECORD_BATCH;
                break;
              }
              case Table.PENDINGEVENT: {
                pendingevents.push({
                  ...object,
                  accountId
                });
                insertRows = pendingevents.length > PENDINGEVENT_BATCH;
                break;
              }
              case Table.PREKEYRECORD: {
                prekeyrecords.push({
                  ...object,
                  accountId
                });
                insertRows = prekeyrecords.length > PREKEYRECORD_BATCH;
                break;
              }
              case Table.SESSIONRECORD: {
                sessionrecords.push({
                  ...object,
                  accountId
                });
                insertRows = sessionrecords.length > SESSIONRECORD_BATCH;
                break;
              }
              case Table.SETTINGS: {
                settings = [...settings, object];
                insertRows = false;
                break;
              }
              case Table.SIGNEDPREKEYRECORD: {
                signedprekeyrecords.push({
                  ...object,
                  accountId
                });
                insertRows =
                  signedprekeyrecords.length > SIGNEDPREKEYRECORD_BATCH;
                break;
              }
              default:
                insertRows = false;
                break;
            }
            lastTableRow = table;
            lineReader.resume();
          } catch (ex) {
            lineReader.close();
            reject(ex);
            return;
          }
        })
        .on('error', reject)
        .on('end', async () => {
          try {
            if (!isStrict) globalManager.progressDBE.set({ current: 4 });
            const idsMap = await insertContacts(
              contacts,
              contactEmailToId,
              trx
            );
            await insertAccountContacts(Object.values(idsMap), accountId, trx);
            await insertRemainingRows(labels, Label(), trx);
            await storeEmailBodies(emails, userEmail, withoutBodiesEncryption);
            await insertRemainingRows(emails, Email(), trx);
            await insertRemainingRows(emailContacts, EmailContact(), trx);
            await insertRemainingEmailLabelsRows(
              emailLabels,
              EmailLabel(),
              trx
            );
            await insertRemainingRows(feeditems, Feeditem(), trx);
            await insertRemainingRows(files, File(), trx);
            await insertRemainingRows(aliases, Alias(), trx);
            await insertRemainingRows(customDomains, CustomDomain(), trx);
            await insertRemainingRows(identities, Identitykeyrecord(), trx);
            await insertRemainingRows(prekeyrecords, Prekeyrecord(), trx);
            await insertRemainingRows(pendingevents, Pendingevent(), trx);
            await insertRemainingRows(sessionrecords, Sessionrecord(), trx);
            await insertRemainingRows(settings, Settings(), trx);
            await insertRemainingRows(
              signedprekeyrecords,
              Signedprekeyrecord(),
              trx
            );
            if (!withoutBodiesEncryption)
              await replaceEmailsWithCopy(userEmail);
            resolve();
          } catch (error) {
            const a = new Error(error.name);
            await removeEmailsCopy(userEmail);
            reject(a);
          }
        });
    });
  });
};

const insertAccountContacts = async (contactIds, accountId, trx) => {
  const accountContacts = contactIds.map(contactId => {
    return { contactId: contactId, accountId };
  });
  await AccountContact().bulkCreate(accountContacts, { transaction: trx });
};

const insertContacts = async (contacts, contactsMap, transaction) => {
  await Contact().bulkCreate(contacts, { transaction, ignoreDuplicates: true });
  const emails = Object.keys(contactsMap);
  const insertedContacts = await Contact().findAll({
    attributes: ['id', 'email'],
    where: {
      email: emails
    },
    raw: true,
    transaction
  });
  if (insertedContacts.length < contacts.length)
    throw new Error('Missing Inserted Rows');
  const oldIdToNewIdMap = {};
  insertedContacts.forEach(contact => {
    const oldId = contactsMap[contact.email];
    const newId = contact.id;
    oldIdToNewIdMap[oldId] = newId;
  });
  return oldIdToNewIdMap;
};

const insertLabels = async (labels, labelsMap, transaction) => {
  await Label().bulkCreate(labels, { transaction });
  const uuids = Object.keys(labelsMap);
  const insertedLabels = await Label().findAll({
    attributes: ['id', 'uuid'],
    where: {
      uuid: uuids
    },
    raw: true,
    transaction
  });
  if (insertedLabels.length < labels.length)
    throw new Error('Missing Inserted Rows');
  const oldIdToNewIdMap = {};
  insertedLabels.forEach(label => {
    const oldId = labelsMap[label.uuid];
    const newId = label.id;
    oldIdToNewIdMap[oldId] = newId;
  });
  return oldIdToNewIdMap;
};

const insertEmails = async (emails, emailsMap, transaction) => {
  await Email().bulkCreate(emails, { transaction });
  const keys = Object.keys(emailsMap);
  const insertedEmails = await Email().findAll({
    attributes: ['id', 'key'],
    where: {
      key: keys
    },
    raw: true,
    transaction
  });
  if (insertedEmails.length < emails.length)
    throw new Error('Missing Inserted Rows');
  const oldIdToNewIdMap = {};
  insertedEmails.forEach(email => {
    const oldId = emailsMap[email.key];
    const newId = email.id;
    oldIdToNewIdMap[oldId] = newId;
  });
  return oldIdToNewIdMap;
};

const insertRemainingRows = async (rows, Table, trx) => {
  if (rows.length > 0) {
    return await Table.bulkCreate(rows, { transaction: trx });
  }
};

const insertRemainingEmailLabelsRows = async (rows, Table, trx) => {
  if (rows.length > 0) {
    for (const row of rows) {
      try {
        await Table.create(row, { transaction: trx });
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const storeEmailBodies = (emailRows, userEmail, withoutEncryption) => {
  if (!userEmail) return;
  const pin = withoutEncryption ? undefined : globalManager.databaseKey.get();
  const isCopy = !withoutEncryption;
  return Promise.all(
    emailRows.map(email => {
      const body = email.content;
      const headers = email.headers;
      email.content = '';
      delete email.headers;
      delete email.content;
      return saveEmailBody({
        body,
        headers,
        username: userEmail,
        metadataKey: email.key,
        password: pin,
        isCopy
      });
    })
  );
};

/* Utils
----------------------------- */
const decryptStreamFile = ({ inputFile, outputFile, key }) => {
  return new Promise((resolve, reject) => {
    const ivStartPosition = 0;
    const ivEndPosition = DEFAULT_KEY_LENGTH;
    const iv = readBytesSync(inputFile, ivStartPosition, ivEndPosition);
    const reader = fs.createReadStream(inputFile, {
      start: DEFAULT_KEY_LENGTH,
      highWaterMark: STREAM_SIZE
    });
    const writer = fs.createWriteStream(outputFile);
    reader
      .pipe(crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv))
      .pipe(zlib.createGunzip())
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

const decryptStreamFileWithPassword = ({ inputFile, outputFile, password }) => {
  return new Promise((resolve, reject) => {
    const saltSize = 8;
    const ivSize = 16;
    const salt = readBytesSync(inputFile, 0, saltSize);
    const iv = readBytesSync(inputFile, saltSize, ivSize);
    const { key } = generateKeyAndIvFromPassword(password, salt);
    const reader = fs.createReadStream(inputFile, {
      start: saltSize + ivSize,
      highWaterMark: STREAM_SIZE
    });
    const writer = fs.createWriteStream(outputFile);
    reader
      .pipe(crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv))
      .pipe(zlib.createGunzip())
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
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

const generateKeyAndIv = (keySize, ivSize) => {
  const keyLength = keySize || DEFAULT_KEY_LENGTH;
  const ivLength = ivSize || DEFAULT_KEY_LENGTH;
  try {
    const key = crypto.randomBytes(keyLength);
    const iv = crypto.randomBytes(ivLength);
    return { key, iv };
  } catch (e) {
    return {
      key: null,
      iv: null
    };
  }
};

const generateKeyAndIvFromPassword = (password, customSalt) => {
  const salt = customSalt || crypto.randomBytes(8);
  const iterations = 10000;
  const pbkdf2Name = 'sha256';
  const key = crypto.pbkdf2Sync(
    Buffer.from(password, 'utf8'),
    salt,
    iterations,
    DEFAULT_KEY_LENGTH,
    pbkdf2Name
  );
  const iv = crypto.randomBytes(DEFAULT_KEY_LENGTH);
  return { key, iv, salt };
};

const getCustomLinesByStream = (filename, lineCount, callback) => {
  const stream = fs.createReadStream(filename, {
    flags: 'r',
    encoding: 'utf-8',
    fd: null,
    mode: 438,
    bufferSize: 64 * 1024
  });

  let data = '';
  let lines = [];
  stream.on('data', function(moreData) {
    data += moreData;
    lines = data.split('\n');
    if (lines.length > lineCount + 1) {
      stream.destroy();
      lines = lines.slice(0, lineCount);
      callback(false, lines);
    }
  });
  stream.on('error', function() {
    callback('Error');
  });
  stream.on('end', function() {
    callback(false, lines);
  });
};

const parseOutgoingDate = date => {
  return moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
};

const parseIncomingDate = date => {
  return moment.utc(date, 'YYYY-MM-DD HH:mm:ss');
};

const readBytesSync = (filePath, filePosition, bytesToRead) => {
  const buf = Buffer.alloc(bytesToRead, 0);
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, bytesToRead, filePosition);
  } finally {
    if (fd) {
      fs.closeSync(fd);
    }
  }
  return buf;
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
  decryptStreamFile,
  decryptStreamFileWithPassword,
  encryptStreamFile,
  exportNotEncryptDatabaseToFile,
  exportContactTable,
  exportEmailTable,
  exportEmailContactTable,
  exportEmailLabelTable,
  exportEncryptDatabaseToFile,
  exportFileTable,
  exportLabelTable,
  generateKeyAndIv,
  generateKeyAndIvFromPassword,
  getCustomLinesByStream,
  importDatabaseFromFile
};
