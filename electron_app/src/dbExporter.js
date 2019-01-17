const knex = require('knex');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const moment = require('moment');
const LineByLineReader = require('line-by-line');
const { Table } = require('./models.js');
const systemLabels = require('./systemLabels');

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

const exportContactTable = async db => {
  let contactRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .select('*')
      .from(Table.CONTACT)
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
      .then(rows =>
        rows.map(row => {
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

const exportLabelTable = async db => {
  let labelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .table(Table.LABEL)
      .select('*')
      .where(`${Table.LABEL}.type`, 'custom')
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
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

const exportEmailTable = async db => {
  let emailRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .table(Table.EMAIL)
      .select('*')
      .whereRaw(whereRawEmailQuery)
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
      .then(rows =>
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
            row['trashDate'] = parseDate(row.unsendDate);
          }

          const key = parseInt(row.key);
          return Object.assign(row, {
            unread: !!row.unread,
            secure: !!row.secure,
            isMuted: !!row.isMuted,
            key,
            date: parseDate(row.date)
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

const exportEmailContactTable = async db => {
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

const exportEmailLabelTable = async db => {
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

const exportFileTable = async db => {
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
      )
      .limit(SELECT_ALL_BATCH)
      .offset(offset)
      .then(rows =>
        rows.map(row =>
          Object.assign(row, {
            readOnly: !!row.readOnly,
            emailId: parseInt(row.emailId),
            date: parseDate(row.date)
          })
        )
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

const exportDatabaseToFile = async ({ databasePath, outputPath }) => {
  const fileName = 'db-exported.criptext';
  const filepath = outputPath || path.join(__dirname, fileName);
  const dbConn = await createDatabaseConnection(databasePath);

  const contacts = await exportContactTable(dbConn);
  const isFirstRecord = true;
  saveToFile({ data: contacts, filepath, mode: 'w' }, isFirstRecord);

  const labels = await exportLabelTable(dbConn);
  saveToFile({ data: labels, filepath, mode: 'a' });

  const emails = await exportEmailTable(dbConn);
  saveToFile({ data: emails, filepath, mode: 'a' });

  const emailContacts = await exportEmailContactTable(dbConn);
  saveToFile({ data: emailContacts, filepath, mode: 'a' });

  const emailLabels = await exportEmailLabelTable(dbConn);
  saveToFile({ data: emailLabels, filepath, mode: 'a' });

  const files = await exportFileTable(dbConn);
  saveToFile({ data: files, filepath, mode: 'a' });

  closeDatabaseConnection(dbConn);
};

/* Import Database from String
------------------------------- */
const importDatabaseFromFile = async ({ filepath, databasePath }) => {
  let contacts = [];
  let labels = [];
  let emails = [];
  let emailContacts = [];
  let emailLabels = [];
  let files = [];
  const dbConn = await createDatabaseConnection(databasePath);

  return dbConn.transaction(async trx => {
    await trx.table(Table.CONTACT).del();
    await trx.table(Table.EMAIL).del();
    await trx.table(Table.EMAIL_CONTACT).del();
    await trx.table(Table.EMAIL_LABEL).del();
    await trx.table(Table.FILE).del();
    await trx
      .table(Table.LABEL)
      .where({ type: 'custom' })
      .del();

    const lineReader = new LineByLineReader(filepath);
    return new Promise(resolve => {
      lineReader
        .on('line', async line => {
          const { table, object } = JSON.parse(line);
          switch (table) {
            case Table.CONTACT: {
              contacts.push(object);
              if (contacts.length === CONTACTS_BATCH) {
                lineReader.pause();
                await trx.insert(contacts).into(Table.CONTACT);
                contacts = [];
                lineReader.resume();
              }
              break;
            }
            case Table.LABEL: {
              labels.push(object);
              if (labels.length === LABELS_BATCH) {
                lineReader.pause();
                await trx.insert(labels).into(Table.LABEL);
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
              const parsedEmail = Object.assign(
                {
                  key: metadataKey || object.key,
                  unsendDate: unsentDate || object.unsendDate,
                  status: object.status || delivered
                },
                object
              );
              emails.push(parsedEmail);
              if (emails.length === EMAILS_BATCH) {
                lineReader.pause();
                await trx.insert(emails).into(Table.EMAIL);
                emails = [];
                lineReader.resume();
              }
              break;
            }
            case 'email_contact': {
              emailContacts.push(object);
              if (emailContacts.length === EMAIL_CONTACTS_BATCH) {
                lineReader.pause();
                await trx.insert(emailContacts).into(Table.EMAIL_CONTACT);
                emailContacts = [];
                lineReader.resume();
              }
              break;
            }
            case 'email_label': {
              emailLabels.push(object);
              if (emailLabels.length === EMAIL_LABELS_BATCH) {
                lineReader.pause();
                await trx.insert(emailLabels).into(Table.EMAIL_LABEL);
                emailLabels = [];
                lineReader.resume();
              }
              break;
            }
            case Table.FILE: {
              files.push(object);
              if (files.length === FILES_BATCH) {
                lineReader.pause();
                await trx.insert(files).into(Table.FILE);
                files = [];
                lineReader.resume();
              }
              break;
            }
            default:
              break;
          }
        })
        .on('end', async () => {
          await insertRemainingRows(contacts, Table.CONTACT, trx);
          await insertRemainingRows(labels, Table.LABEL, trx);
          await insertRemainingRows(emails, Table.EMAIL, trx);
          await insertRemainingRows(emailContacts, Table.EMAIL_CONTACT, trx);
          await insertRemainingRows(emailLabels, Table.EMAIL_LABEL, trx);
          await insertRemainingRows(files, Table.FILE, trx);
          resolve();
        });
    });
  });
};

const insertRemainingRows = async (rows, tablename, trx) => {
  if (rows.length > 0) {
    return await trx.insert(rows).into(tablename);
  }
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
