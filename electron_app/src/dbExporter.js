const knex = require('knex');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const moment = require('moment');
const LineByLineReader = require('line-by-line');
const { Table } = require('./models.js');
const systemLabels = require('./systemLabels');
const {
  getEmailBody,
  getEmailHeaders,
  saveEmailBody
} = require('./utils/FileUtils');
const myAccount = require('./Account');
const { APP_DOMAIN } = require('./utils/const');

const CIPHER_ALGORITHM = 'aes128';
const STREAM_SIZE = 512 * 1024;
const DEFAULT_KEY_LENGTH = 16;

/* Batches
----------------------------- */
const SELECT_ALL_BATCH = 500;

const CONTACTS_BATCH = 50;
const LABELS_BATCH = 50;
const EMAILS_BATCH = 50;
const EMAIL_CONTACTS_BATCH = 100;
const EMAIL_LABELS_BATCH = 100;
const FILES_BATCH = 50;

const excludedEmailStatus = [1, 4];
const excludedLabels = [systemLabels.draft.id];

const whereRawEmailQuery = `
  ${Table.EMAIL}.status NOT IN (${excludedEmailStatus.join(',')}) AND
  NOT EXISTS (
    SELECT * 
    FROM ${Table.EMAIL_LABEL} 
    WHERE ${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId 
    AND ${Table.EMAIL_LABEL}.labelId in (${excludedLabels.join(',')})
  )
`;

/* Database Connection
----------------------------- */
const createDatabaseConnection = dbPath => {
  const dbConfiguration = {
    client: 'sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true
  };
  return knex(dbConfiguration);
};

const closeDatabaseConnection = dbConnection => {
  dbConnection.destroy();
};

/* Export Database to String
----------------------------- */
const parseDate = date => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const formatTableRowsToString = (tableName, rowsObject) => {
  return rowsObject
    .map(row => JSON.stringify({ table: tableName, object: row }))
    .join('\n');
};

const exportContactTable = async (db, accountId) => {
  let contactRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .select('*')
      .from(Table.CONTACT)
      .whereIn(
        'id',
        db
          .select('contactId')
          .from(Table.ACCOUNT_CONTACT)
          .where({ accountId })
      )
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
      .then(rows =>
        rows.map(row => {
          delete row.score;
          if (!row.name) {
            delete row.name;
          }
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

const exportLabelTable = async (db, accountId) => {
  let labelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .table(Table.LABEL)
      .select('*')
      .where('type', 'custom')
      .andWhere({ accountId })
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
      .then(rows =>
        rows.map(row => {
          delete row.accountId;
          return Object.assign(row, { visible: !!row.visible });
        })
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

const exportEmailTable = async (db, accountId) => {
  const username = `${myAccount.recipientId}@${APP_DOMAIN}`;
  let emailRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const rows = await db
      .table(Table.EMAIL)
      .select('*')
      .whereRaw(whereRawEmailQuery)
      .andWhere({ accountId })
      .limit(SELECT_ALL_BATCH)
      .offset(offset);
    const result = await Promise.all(
      rows.map(async row => {
        delete row.accountId;

        if (!row.unsendDate) {
          delete row.unsendDate;
        } else {
          row['unsentDate'] = parseDate(row.unsendDate);
          delete row.unsendDate;
        }

        if (!row.trashDate) {
          delete row.trashDate;
        } else {
          row['trashDate'] = parseDate(row.unsendDate);
        }

        if (row.replyTo === null) {
          row.replyTo = '';
        }

        if (!row.boundary) {
          delete row.boundary;
        }

        const body =
          (await getEmailBody({ username, metadataKey: row.key })) ||
          row.content;
        const headers = await getEmailHeaders({
          username,
          metadataKey: row.key
        });

        const key = parseInt(row.key);
        return Object.assign(
          row,
          {
            unread: !!row.unread,
            secure: !!row.secure,
            isMuted: !!row.isMuted,
            content: body,
            key,
            date: parseDate(row.date)
          },
          headers ? { headers } : null
        );
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

const exportEmailContactTable = async (db, accountId) => {
  let emailContactRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .table(Table.EMAIL_CONTACT)
      .select('*')
      .whereExists(
        db
          .select('*')
          .from(Table.EMAIL)
          .whereRaw(`${Table.EMAIL}.id = ${Table.EMAIL_CONTACT}.emailId`)
          .whereRaw(whereRawEmailQuery)
          .whereRaw(`${Table.EMAIL}.accountId = ${accountId}`)
      )
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
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

const exportEmailLabelTable = async (db, accountId) => {
  let emailLabelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .table(Table.EMAIL_LABEL)
      .select('*')
      .whereExists(
        db
          .select('*')
          .from(Table.EMAIL)
          .whereRaw(`${Table.EMAIL}.id = ${Table.EMAIL_LABEL}.emailId`)
          .whereRaw(whereRawEmailQuery)
          .whereRaw(`${Table.EMAIL}.accountId = ${accountId}`)
      )
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
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

const exportFileTable = async (db, accountId) => {
  let fileRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .table(Table.FILE)
      .select('*')
      .whereExists(
        db
          .select('*')
          .from(Table.EMAIL)
          .whereRaw(`${Table.EMAIL}.id = ${Table.FILE}.emailId`)
          .whereRaw(whereRawEmailQuery)
          .whereRaw(`${Table.EMAIL}.accountId = ${accountId}`)
      )
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
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

const exportDatabaseToFile = async ({
  databasePath,
  outputPath,
  accountId
}) => {
  const fileName = 'db-exported.criptext';
  const filepath = outputPath || path.join(__dirname, fileName);
  const dbConn = await createDatabaseConnection(databasePath);

  const contacts = await exportContactTable(dbConn, accountId);
  const isFirstRecord = true;
  saveToFile({ data: contacts, filepath, mode: 'w' }, isFirstRecord);

  const labels = await exportLabelTable(dbConn, accountId);
  saveToFile({ data: labels, filepath, mode: 'a' });

  const emails = await exportEmailTable(dbConn, accountId);
  saveToFile({ data: emails, filepath, mode: 'a' });

  const emailContacts = await exportEmailContactTable(dbConn, accountId);
  saveToFile({ data: emailContacts, filepath, mode: 'a' });

  const emailLabels = await exportEmailLabelTable(dbConn, accountId);
  saveToFile({ data: emailLabels, filepath, mode: 'a' });

  const files = await exportFileTable(dbConn, accountId);
  saveToFile({ data: files, filepath, mode: 'a' });

  closeDatabaseConnection(dbConn);
};

let relationsMap = {
  [Table.CONTACT]: {},
  [Table.LABEL]: {},
  [Table.EMAIL]: {}
};

/* Import Database from String
------------------------------- */
const importDatabaseFromFile = async ({
  filepath,
  databasePath,
  accountId,
  resetAccountData
}) => {
  let contacts = [];
  let labels = [];
  let emails = [];
  let emailContacts = [];
  let emailLabels = [];
  let files = [];
  const dbConn = await createDatabaseConnection(databasePath);

  return dbConn.transaction(async trx => {
    const lineReader = new LineByLineReader(filepath);

    if (resetAccountData === true) {
      await trx
        .table(Table.ACCOUNT_CONTACT)
        .where({ accountId })
        .del();
      await trx
        .table(Table.LABEL)
        .where({ accountId })
        .del();
      await trx
        .table(Table.EMAIL)
        .where({ accountId })
        .del();
    }

    const insertContactBatch = async contactBatch => {
      const contactIdsByAccount = await mapRelationsAndInsert(
        Table.CONTACT,
        contactBatch,
        'email',
        trx
      );
      const accountContactRelations = contactIdsByAccount.map(contactId => ({
        contactId,
        accountId
      }));
      await trx.insert(accountContactRelations).into(Table.ACCOUNT_CONTACT);
    };

    const insertLabelBatch = async labelBatch => {
      await mapRelationsAndInsert(Table.LABEL, labelBatch, null, trx);
    };

    const insertEmailBatch = async emailBatch => {
      await storeEmailBodies(emailBatch);
      await mapRelationsAndInsert(Table.EMAIL, emailBatch, null, trx);
    };

    const insertEmailContactBatch = async emailContactBatch => {
      await trx.insert(emailContactBatch).into(Table.EMAIL_CONTACT);
    };

    const insertEmailLabelBatch = async emailLabelBatch => {
      await trx.insert(emailLabelBatch).into(Table.EMAIL_LABEL);
    };

    const insertFileBatch = async fileBatch => {
      await trx.insert(fileBatch).into(Table.FILE);
    };

    return new Promise(resolve => {
      lineReader
        .on('line', async line => {
          const { table, object } = JSON.parse(line);
          switch (table) {
            case Table.CONTACT: {
              contacts.push(object);
              if (contacts.length === CONTACTS_BATCH) {
                lineReader.pause();
                await insertContactBatch(contacts);
                contacts = [];
                lineReader.resume();
              }
              break;
            }

            case Table.LABEL: {
              const updatedObject = Object.assign(object, { accountId });
              labels.push(updatedObject);
              if (labels.length === LABELS_BATCH) {
                lineReader.pause();
                await insertLabelBatch(labels);
                labels = [];
                lineReader.resume();
              }
              break;
            }

            case Table.EMAIL: {
              const { delivered, metadataKey, unsentDate } = object;
              delete object.delivered;
              delete object.metadataKey;
              delete object.unsentDate;
              const parsedEmail = Object.assign(object, {
                key: metadataKey || object.key,
                unsendDate: unsentDate || object.unsendDate,
                status: object.status || delivered,
                accountId
              });
              emails.push(parsedEmail);
              if (emails.length === EMAILS_BATCH) {
                lineReader.pause();
                await insertEmailBatch(emails);
                emails = [];
                lineReader.resume();
              }
              break;
            }

            case 'email_contact': {
              // Insert Remaining Previous Data
              if (emails.length) {
                lineReader.pause();
                await insertEmailBatch(emails);
                emails = [];
                lineReader.resume();
              }
              if (contacts.length) {
                lineReader.pause();
                await insertContactBatch(contacts);
                contacts = [];
                lineReader.resume();
              }
              const updatedObject = {
                contactId:
                  relationsMap[Table.CONTACT][object.contactId] ||
                  object.contactId,
                emailId:
                  relationsMap[Table.EMAIL][object.emailId] || object.emailId,
                type: object.type
              };
              emailContacts.push(updatedObject);
              if (emailContacts.length === EMAIL_CONTACTS_BATCH) {
                lineReader.pause();
                await insertEmailContactBatch(emailContacts);
                emailContacts = [];
                lineReader.resume();
              }
              break;
            }

            case 'email_label': {
              // Insert Remaining Dependencies
              if (emails.length) {
                lineReader.pause();
                await insertEmailBatch(emails);
                emails = [];
                lineReader.resume();
              }
              if (labels.length) {
                lineReader.pause();
                await insertLabelBatch(labels);
                labels = [];
                lineReader.resume();
              }
              const updatedObject = {
                labelId:
                  relationsMap[Table.LABEL][object.labelId] || object.labelId,
                emailId:
                  relationsMap[Table.EMAIL][object.emailId] || object.emailId
              };
              emailLabels.push(updatedObject);
              if (emailLabels.length === EMAIL_LABELS_BATCH) {
                lineReader.pause();
                await insertEmailLabelBatch(emailLabels);
                emailLabels = [];
                lineReader.resume();
              }
              break;
            }

            case Table.FILE: {
              // Insert Remaining Dependencies
              if (emails.length) {
                lineReader.pause();
                await insertEmailBatch(emails);
                emails = [];
                lineReader.resume();
              }
              delete object.id;
              files.push(object);
              if (files.length === FILES_BATCH) {
                lineReader.pause();
                await insertFileBatch(files);
                files = [];
                lineReader.resume();
              }
              break;
            }
            default:
              break;
          }
        })
        .on('error', console.log)
        .on('end', async () => {
          if (emailContacts.length) {
            await insertEmailContactBatch(emailContacts);
            emailContacts = [];
          }
          if (emailLabels.length) {
            await insertEmailLabelBatch(emailLabels);
            emailLabels = [];
          }
          if (files.length) {
            await insertFileBatch(files);
            files = [];
          }
          relationsMap = {
            [Table.CONTACT]: {},
            [Table.LABEL]: {},
            [Table.EMAIL]: {}
          };
          resolve();
        });
    });
  });
};

const mapRelationsAndInsert = async (table, rows, uniqueField, trx) => {
  let foundIds = [];
  let nonExistingRows = rows;
  if (typeof uniqueField === 'string') {
    const uniqueValuesArray = rows.map(row => row[uniqueField]);
    const foundValues = await trx
      .select('*')
      .from(table)
      .whereIn(`${uniqueField}`, uniqueValuesArray);
    for (const found of foundValues) {
      const existingRow = rows.find(
        row => row[uniqueField] === found[uniqueField]
      );
      relationsMap[table][existingRow.id] = found.id;
    }
    foundIds = foundValues.map(row => row.id);
    nonExistingRows = rows.filter(row => !relationsMap[table][row.id]);
  }
  let insertedIds = [];
  if (nonExistingRows.length) {
    const valuesToInsert = nonExistingRows.map(row => {
      const newRow = Object.assign({}, row);
      delete newRow.id;
      return newRow;
    });
    const [lastInsertedId] = await trx.insert(valuesToInsert).into(table);
    insertedIds = generateIdsArray(nonExistingRows.length, lastInsertedId);
    for (let i = 0; i < nonExistingRows.length; i++) {
      const nonExistingRow = nonExistingRows[i];
      relationsMap[table][nonExistingRow.id] = insertedIds[i];
    }
  }
  return [...foundIds, ...insertedIds];
};

const generateIdsArray = (length, lastNumber) => {
  return Array.apply(null, { length }).map(
    (it, index) => index + (lastNumber - length + 1)
  );
};

const storeEmailBodies = emailRows => {
  const username = `${myAccount.recipientId}@${APP_DOMAIN}`;
  return Promise.all(
    emailRows.map(email => {
      const body = email.content;
      const headers = email.headers;
      email.content = '';
      delete email.headers;
      return saveEmailBody({ body, headers, username, metadataKey: email.key });
    })
  );
};

/* Encrypt and Decrypt
------------------------------- */
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

const encryptStreamFile = ({ inputFile, outputFile, key, iv }) => {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(inputFile, {
      highWaterMark: STREAM_SIZE
    });
    const writer = fs.createWriteStream(outputFile);
    writer.write(iv);

    reader
      .pipe(zlib.createGzip())
      .pipe(crypto.createCipheriv(CIPHER_ALGORITHM, key, iv))
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

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

module.exports = {
  closeDatabaseConnection,
  createDatabaseConnection,
  encryptStreamFile,
  exportContactTable,
  exportLabelTable,
  exportEmailTable,
  exportEmailContactTable,
  exportEmailLabelTable,
  exportFileTable,
  exportDatabaseToFile,
  decryptStreamFile,
  generateKeyAndIv,
  importDatabaseFromFile
};
