const fs = require('fs');
const knex = require('knex');
const LineByLineReader = require('line-by-line');
const moment = require('moment');
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
  getDB,
  Table
} = require('./DBEmanager');

const excludedEmailStatus = [1, 4];
const whereRawEmailQuery = `
  ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')})`;

/* Batches
----------------------------- */
const CONTACTS_BATCH = 50;
const EMAIL_CONTACTS_BATCH = 100;
const EMAIL_LABELS_BATCH = 100;
const EMAILS_BATCH = 50;
const FEEDITEM_BATCH = 50;
const FILES_BATCH = 50;
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

  const accounts = await _exportAccountTable(dbConn);
  saveToFile({ data: accounts, filepath, mode: 'w' }, true);

  const contacts = await _exportContactTable(dbConn);
  saveToFile({ data: contacts, filepath, mode: 'a' });

  const labels = await _exportLabelTable(dbConn);
  saveToFile({ data: labels, filepath, mode: 'a' });

  const emails = await _exportEmailTable(dbConn);
  saveToFile({ data: emails, filepath, mode: 'a' });

  const emailContacts = await _exportEmailContactTable(dbConn);
  saveToFile({ data: emailContacts, filepath, mode: 'a' });

  const emailLabels = await _exportEmailLabelTable(dbConn);
  saveToFile({ data: emailLabels, filepath, mode: 'a' });

  const feeditems = await _exportFeedItemTable(dbConn);
  saveToFile({ data: feeditems, filepath, mode: 'a' });

  const files = await _exportFileTable(dbConn);
  saveToFile({ data: files, filepath, mode: 'a' });

  const identities = await _exportIdentitykeyrecordTable(dbConn);
  saveToFile({ data: identities, filepath, mode: 'a' });

  const pendingevents = await _exportPendingeventTable(dbConn);
  saveToFile({ data: pendingevents, filepath, mode: 'a' });

  const prekeyrecords = await _exportPrekeyrecordTable(dbConn);
  saveToFile({ data: prekeyrecords, filepath, mode: 'a' });

  const sessionrecords = await _exportSessionrecordTable(dbConn);
  saveToFile({ data: sessionrecords, filepath, mode: 'a' });

  const settings = await _exportSettingsTable(dbConn);
  saveToFile({ data: settings, filepath, mode: 'a' });

  const signedprekeyrecords = await _exportSignedprekeyrecordTable(dbConn);
  saveToFile({ data: signedprekeyrecords, filepath, mode: 'a' });

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
  return formatTableRowsToString(Table.ACCOUNT, accountRows);
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

const _exportEmailTable = async db => {
  let emailRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const rows = await db.raw(
      `SELECT * FROM ${
        Table.EMAIL
      } WHERE ${whereRawEmailQuery} LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
    );
    const result = await Promise.all(
      rows.map(row => {
        if (!row.unsendDate) {
          delete row.unsendDate;
        } else {
          row['unsentDate'] = parseDate(row.unsendDate);
          delete row.unsendDate;
        }

        if (!row.trashDate) {
          delete row.trashDate;
        } else {
          row['trashDate'] = parseDate(row.trashDate);
        }

        if (row.replyTo === null) {
          row.replyTo = '';
        }

        if (!row.boundary) {
          delete row.boundary;
        }

        const body = row.content;
        const key = parseInt(row.key);
        return Object.assign(row, {
          unread: !!row.unread,
          secure: !!row.secure,
          content: body,
          key,
          date: parseDate(row.date)
        });
      })
    );
    emailRows = [...emailRows, ...result];
    if (rows.length < SELECT_ALL_BATCH) {
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
        `SELECT * FROM ${Table.EMAIL_CONTACT} WHERE EXISTS (SELECT * FROM ${
          Table.EMAIL
        } WHERE ${Table.EMAIL}.id=${
          Table.EMAIL_CONTACT
        }.emailId AND ${whereRawEmailQuery}) LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
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
        `SELECT * FROM ${Table.EMAIL_LABEL} WHERE EXISTS (SELECT * FROM ${
          Table.EMAIL
        } WHERE ${Table.EMAIL}.id=${
          Table.EMAIL_LABEL
        }.emailId AND ${whereRawEmailQuery}) LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
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
        `SELECT * FROM ${Table.FILE} WHERE EXISTS (SELECT * FROM ${
          Table.EMAIL
        } WHERE ${Table.EMAIL}.id=${
          Table.FILE
        }.emailId AND ${whereRawEmailQuery}) LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
      .then(rows =>
        rows.map(row => {
          if (!row.cid) {
            delete row.cid;
          }

          return Object.assign(row, {
            readOnly: !!row.readOnly,
            emailId: parseInt(row.emailId),
            date: parseDate(row.date)
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
const importDatabaseFromFile = async ({ filepath }) => {
  let accounts = [];
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

  const sequelize = getDB();

  return await sequelize.transaction(trx => {
    const lineReader = new LineByLineReader(filepath);
    return new Promise((resolve, reject) => {
      lineReader
        .on('line', async line => {
          const { table, object } = JSON.parse(line);
          switch (table) {
            case Table.ACCOUNT: {
              accounts = [...accounts, object];
              break;
            }
            case Table.CONTACT: {
              contacts.push(object);
              if (contacts.length === CONTACTS_BATCH) {
                lineReader.pause();
                await Contact().bulkCreate(contacts, { transaction: trx });
                contacts = [];
                lineReader.resume();
              }
              break;
            }
            case Table.LABEL: {
              labels.push(object);
              if (labels.length === LABELS_BATCH) {
                lineReader.pause();
                await Label().bulkCreate(labels, { transaction: trx });
                labels = [];
                lineReader.resume();
              }
              break;
            }
            case Table.EMAIL: {
              emails.push(object);
              if (emails.length === EMAILS_BATCH) {
                lineReader.pause();
                await Email().bulkCreate(emails, { transaction: trx });
                emails = [];
                lineReader.resume();
              }
              break;
            }
            case 'email_contact': {
              emailContacts.push(object);
              if (emailContacts.length === EMAIL_CONTACTS_BATCH) {
                lineReader.pause();
                try {
                  await EmailContact().bulkCreate(emailContacts, {
                    transaction: trx
                  });
                  emailContacts = [];
                } catch (error) {
                  console.log('email_contact', error);
                }
                lineReader.resume();
              }
              break;
            }
            case 'email_label': {
              emailLabels.push(object);
              if (emailLabels.length === EMAIL_LABELS_BATCH) {
                lineReader.pause();
                try {
                  await EmailLabel().bulkCreate(emailLabels, {
                    transaction: trx
                  });
                  emailLabels = [];
                } catch (error) {
                  console.log('email_label', error);
                }
                lineReader.resume();
              }
              break;
            }
            case Table.FEEDITEM: {
              feeditems.push(object);
              if (feeditems.length === FEEDITEM_BATCH) {
                lineReader.pause();
                await Feeditem().bulkCreate(feeditems, { transaction: trx });
                feeditems = [];
                lineReader.resume();
              }
              break;
            }
            case Table.FILE: {
              files.push(object);
              if (files.length === FILES_BATCH) {
                lineReader.pause();
                await File().bulkCreate(files, { transaction: trx });
                files = [];
                lineReader.resume();
              }
              break;
            }
            case Table.IDENTITYKEYRECORD: {
              identities.push(object);
              if (identities.length === IDENTITYKEYRECORD_BATCH) {
                lineReader.pause();
                await Identitykeyrecord().bulkCreate(identities, {
                  transaction: trx
                });
                identities = [];
                lineReader.resume();
              }
              break;
            }
            case Table.PENDINGEVENT: {
              pendingevents.push(object);
              if (pendingevents.length === PENDINGEVENT_BATCH) {
                lineReader.pause();
                await Pendingevent().bulkCreate(pendingevents, {
                  transaction: trx
                });
                pendingevents = [];
                lineReader.resume();
              }
              break;
            }
            case Table.PREKEYRECORD: {
              prekeyrecords.push(object);
              if (prekeyrecords.length === PREKEYRECORD_BATCH) {
                lineReader.pause();
                await Prekeyrecord().bulkCreate(prekeyrecords, {
                  transaction: trx
                });
                prekeyrecords = [];
                lineReader.resume();
              }
              break;
            }
            case Table.SESSIONRECORD: {
              sessionrecords.push(object);
              if (sessionrecords.length === SESSIONRECORD_BATCH) {
                lineReader.pause();
                await Sessionrecord().bulkCreate(sessionrecords, {
                  transaction: trx
                });
                sessionrecords = [];
                lineReader.resume();
              }
              break;
            }
            case Table.SETTINGS: {
              settings = [...settings, object];
              break;
            }
            case Table.SIGNEDPREKEYRECORD: {
              signedprekeyrecords.push(object);
              if (signedprekeyrecords.length === SIGNEDPREKEYRECORD_BATCH) {
                lineReader.pause();
                await Signedprekeyrecord().bulkCreate(signedprekeyrecords, {
                  transaction: trx
                });
                signedprekeyrecords = [];
                lineReader.resume();
              }
              break;
            }
            default:
              break;
          }
        })
        .on('error', reject)
        .on('end', async () => {
          await insertRemainingRows(accounts, Account(), trx);
          await insertRemainingRows(contacts, Contact(), trx);
          await insertRemainingRows(labels, Label(), trx);
          await insertRemainingRows(emails, Email(), trx);
          await insertRemainingRows(emailContacts, EmailContact(), trx);
          await insertRemainingRows(emailLabels, EmailLabel(), trx);
          await insertRemainingRows(feeditems, Feeditem(), trx);
          await insertRemainingRows(files, File(), trx);
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
          resolve();
        });
    });
  });
};

const insertRemainingRows = async (rows, Table, trx) => {
  if (rows.length > 0) {
    return await Table.bulkCreate(rows, { transaction: trx });
  }
};

/* Utils
----------------------------- */
const formatTableRowsToString = (tableName, rowsObject) => {
  return rowsObject
    .map(row => JSON.stringify({ table: tableName, object: row }))
    .join('\n');
};

const parseDate = date => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const saveToFile = ({ data, filepath, mode }, isFirstRecord) => {
  const flag = mode || 'w';
  try {
    if (data.length > 0) {
      const dataToWrite = isFirstRecord ? data : '\n' + data;
      fs.writeFileSync(filepath, dataToWrite, { encoding: 'utf-8', flag });
    }
  } catch (e) {
    return;
  }
};

module.exports = {
  exportNotEncryptDatabaseToFile,
  importDatabaseFromFile
};
