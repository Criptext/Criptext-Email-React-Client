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
const { APP_DOMAIN, LINK_DEVICES_FILE_VERSION } = require('./utils/const');

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
      .raw(
        `SELECT * FROM ${
          Table.CONTACT
        } LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
      )
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

const exportLabelTable = async db => {
  let labelRows = [];
  let shouldEnd = false;
  let offset = 0;
  while (!shouldEnd) {
    const result = await db
      .raw(
        `SELECT * FROM ${
          Table.LABEL
        } WHERE type='custom' LIMIT ${SELECT_ALL_BATCH} OFFSET ${offset}`
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

const exportEmailTable = async db => {
  const username = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${APP_DOMAIN}`;
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
      rows.map(async row => {
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

const exportEmailContactTable = async db => {
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

const exportEmailLabelTable = async db => {
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

const exportFileTable = async db => {
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

  const [recipientId, domain] = myAccount.recipientId.split('@');
  const fileInformation = JSON.stringify({
    fileVersion: LINK_DEVICES_FILE_VERSION,
    recipientId: recipientId,
    domain: domain || APP_DOMAIN
  });
  saveToFile({ data: fileInformation, filepath, mode: 'w' }, true);

  const contacts = await exportContactTable(dbConn);
  saveToFile({ data: contacts, filepath, mode: 'a' });

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

const importDatabaseFromFile = async ({ filepath, databasePath }) => {
  let contacts = [];
  let labels = [];
  let emails = [];
  let emailContacts = [];
  let emailLabels = [];
  let files = [];

  const dbConn = await createDatabaseConnection(databasePath);
  return dbConn.transaction(async trx => {
    getCustomLinesByStream(filepath, 1, (err, lines) => {
      if (err) throw new Error('Failed to read file information');
      const fileInformation = lines[0];
      const { fileVersion, recipientId, domain } = JSON.parse(fileInformation);

      if (recipientId && domain) {
        const fileOwner = `${recipientId}@${domain}`;
        const currentAddress = myAccount.recipientId.includes('@')
          ? myAccount.recipientId
          : `${myAccount.recipientId}@${APP_DOMAIN}`;
        if (fileOwner !== currentAddress) {
          return trx.rollback();
        }
      }
      if (fileVersion) {
        const version = Number(fileVersion);
        const currentVersion = Number(LINK_DEVICES_FILE_VERSION);
        if (version !== currentVersion) {
          return trx.rollback();
        }
      }
    });

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
    return new Promise((resolve, reject) => {
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
                await storeEmailBodies(emails);
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
        .on('error', reject)
        .on('end', async () => {
          await insertRemainingRows(contacts, Table.CONTACT, trx);
          await insertRemainingRows(labels, Table.LABEL, trx);
          await storeEmailBodies(emails);
          await insertRemainingRows(emails, Table.EMAIL, trx);
          await insertRemainingRows(emailContacts, Table.EMAIL_CONTACT, trx);
          await insertRemainingRows(emailLabels, Table.EMAIL_LABEL, trx);
          await insertRemainingRows(files, Table.FILE, trx);
          resolve();
        });
    });
  });
};

const storeEmailBodies = emailRows => {
  const username = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${APP_DOMAIN}`;
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
  generateKeyAndIvFromPassword,
  importDatabaseFromFile,
  decryptStreamFileWithPassword
};
