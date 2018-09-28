const knex = require('knex');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const LineByLineReader = require('line-by-line');
const { Table } = require('./models.js');

const CIPHER_ALGORITHM = 'aes128';
const STREAM_SIZE = 512 * 1024;
const DEFAULT_KEY_LENGTH = 16;

/* Batches
----------------------------- */
const CONTACTS_BATCH = 50;
const LABELS_BATCH = 50;
const EMAILS_BATCH = 50;
const EMAIL_CONTACTS_BATCH = 100;
const EMAIL_LABELS_BATCH = 100;
const FILES_BATCH = 50;
const FILE_KEYS_BATCH = 50;

/* Database Connection
----------------------------- */
const createDatabaseConnection = dbPath => {
  const dbConfiguration = {
    client: 'sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: false
  };
  return knex(dbConfiguration);
};

const closeDatabaseConnection = dbConnection => {
  dbConnection.destroy();
};

/* Export Database to String
----------------------------- */
const formatTableRowsToString = (tableName, rowsObject) => {
  return rowsObject
    .map(row => JSON.stringify({ table: tableName, object: row }))
    .join('\n');
};

const exportContactTable = async db => {
  const contactRows = await db.select('*').from(Table.CONTACT);
  return formatTableRowsToString(Table.CONTACT, contactRows);
};

const exportLabelTable = async db => {
  const labelRows = await db.table(Table.LABEL).select('*');
  return formatTableRowsToString(Table.LABEL, labelRows);
};

const exportEmailTable = async db => {
  const emailRows = await db.table(Table.EMAIL).select('*');
  return formatTableRowsToString(Table.EMAIL, emailRows);
};

const exportEmailContactTable = async db => {
  const emailContactRows = await db.table(Table.EMAIL_CONTACT).select('*');
  return formatTableRowsToString(Table.EMAIL_CONTACT, emailContactRows);
};

const exportEmailLabelTable = async db => {
  const emailLabelRows = await db.table(Table.EMAIL_LABEL).select('*');
  return formatTableRowsToString(Table.EMAIL_LABEL, emailLabelRows);
};

const exportFileTable = async db => {
  const fileRows = await db.table(Table.FILE).select('*');
  return formatTableRowsToString(Table.FILE, fileRows);
};

const exportFileKeyTable = async db => {
  const fileKeyRows = await db.table(Table.FILE_KEY).select('*');
  return formatTableRowsToString(Table.FILE_KEY, fileKeyRows);
};

const saveToFile = ({ data, filepath, mode }) => {
  const flag = mode || 'w';
  try {
    return fs.writeFileSync(filepath, data, { encoding: 'utf-8', flag });
  } catch (e) {
    return;
  }
};

const exportDatabaseToFile = async ({ datapasePath, outputPath }) => {
  const fileName = 'db-exported.criptext';
  const filepath = outputPath || path.join(__dirname, fileName);
  const dbConn = await createDatabaseConnection(datapasePath);

  const contacts = (await exportContactTable(dbConn)) + '\n';
  saveToFile({ data: contacts, filepath, mode: 'w' });

  const labels = (await exportLabelTable(dbConn)) + '\n';
  saveToFile({ data: labels, filepath, mode: 'a' });

  const emails = (await exportEmailTable(dbConn)) + '\n';
  saveToFile({ data: emails, filepath, mode: 'a' });

  const emailContacts = (await exportEmailContactTable(dbConn)) + '\n';
  saveToFile({ data: emailContacts, filepath, mode: 'a' });

  const emailLabels = (await exportEmailLabelTable(dbConn)) + '\n';
  saveToFile({ data: emailLabels, filepath, mode: 'a' });

  const files = (await exportFileTable(dbConn)) + '\n';
  saveToFile({ data: files, filepath, mode: 'a' });

  const fileKeys = (await exportFileKeyTable(dbConn)) + '\n';
  saveToFile({ data: fileKeys, filepath, mode: 'a' });

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
  let fileKeys = [];
  const dbConn = await createDatabaseConnection(databasePath);

  return dbConn.transaction(trx => {
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
              emails.push(object);
              if (emails.length === EMAILS_BATCH) {
                lineReader.pause();
                await trx.insert(emails).into(Table.EMAIL);
                emails = [];
                lineReader.resume();
              }
              break;
            }
            case Table.EMAIL_CONTACT: {
              emailContacts.push(object);
              if (emailContacts.length === EMAIL_CONTACTS_BATCH) {
                lineReader.pause();
                await trx.insert(emailContacts).into(Table.EMAIL_CONTACT);
                emailContacts = [];
                lineReader.resume();
              }
              break;
            }
            case Table.EMAIL_LABEL: {
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
            case Table.FILE_KEY: {
              fileKeys.push(object);
              if (fileKeys.length === FILE_KEYS_BATCH) {
                lineReader.pause();
                await trx.insert(fileKeys).into(Table.FILE_KEY);
                fileKeys = [];
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
          await insertRemainingRows(fileKeys, Table.FILE_KEY, trx);
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
  exportFileKeyTable,
  exportDatabaseToFile,
  decryptStreamFile,
  generateKeyAndIv,
  importDatabaseFromFile
};
