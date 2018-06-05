const path = require('path');
const { app } = require('electron');

const getDbPath = node_env => {
  switch (node_env) {
    case 'test': {
      return './src/__integrations__/test.db';
    }
    case 'development': {
      return path
        .join(__dirname, '/Criptext.db')
        .replace('/app.asar', '')
        .replace('/src', '');
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, '/Criptext.db')
        .replace('/app.asar', '')
        .replace('/src', '');
    }
  }
};

const myDBPath = getDbPath(process.env.NODE_ENV);
const TINY_STRING_SIZE = 8;
const XSMALL_STRING_SIZE = 16;
const SMALL_STRING_SIZE = 32;
const MEDIUM_STRING_SIZE = 64;
const LARGE_STRING_SIZE = 100;
const XLARGE_STRING_SIZE = 200;

const Table = {
  EMAIL: 'email',
  LABEL: 'label',
  EMAIL_LABEL: 'emailLabel',
  CONTACT: 'contact',
  EMAIL_CONTACT: 'emailContact',
  FILE: 'file',
  OPEN: 'open',
  ACCOUNT: 'account',
  FEED: 'feed',
  PREKEYRECORD: 'prekeyrecord',
  SIGNEDPREKEYRECORD: 'signedprekeyrecord',
  SESSIONRECORD: 'sessionrecord',
  IDENTITYKEYRECORD: 'identitykeyrecord'
};

const db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: myDBPath
  },
  useNullAsDefault: false
});

const cleanDataBase = () => {
  return db.schema
    .dropTableIfExists(Table.EMAIL)
    .dropTableIfExists(Table.LABEL)
    .dropTableIfExists(Table.EMAIL_LABEL)
    .dropTableIfExists(Table.CONTACT)
    .dropTableIfExists(Table.EMAIL_CONTACT)
    .dropTableIfExists(Table.FILE)
    .dropTableIfExists(Table.OPEN)
    .dropTableIfExists(Table.FEED)
    .dropTableIfExists(Table.ACCOUNT)
    .dropTableIfExists(Table.PREKEYRECORD)
    .dropTableIfExists(Table.SIGNEDPREKEYRECORD)
    .dropTableIfExists(Table.SESSIONRECORD)
    .dropTableIfExists(Table.IDENTITYKEYRECORD);
};

const createContactColumns = table => {
  table.increments('id').primary();
  table
    .string('email', MEDIUM_STRING_SIZE)
    .unique()
    .notNullable();
  table.string('name', MEDIUM_STRING_SIZE);
};

const createLabelColumns = table => {
  table.increments('id').primary();
  table
    .string('text', MEDIUM_STRING_SIZE)
    .unique()
    .notNullable();
  table.string('color', TINY_STRING_SIZE).notNullable();
  table.string('type', TINY_STRING_SIZE).defaultTo('custom');
  table.boolean('visible').defaultTo(false);
};

const createEmailColumns = table => {
  table.increments('id').primary();
  table
    .string('key', SMALL_STRING_SIZE)
    .unique()
    .notNullable();
  table.string('threadId', SMALL_STRING_SIZE);
  table.string('s3Key', SMALL_STRING_SIZE);
  table.string('subject').notNullable();
  table.text('content').notNullable();
  table.string('preview', LARGE_STRING_SIZE).notNullable();
  table.dateTime('date').notNullable();
  table.integer('delivered').notNullable();
  table.boolean('unread').notNullable();
  table.boolean('secure').notNullable();
  table.boolean('isMuted').notNullable();
};

const createEmailLabelColumns = table => {
  table.increments('id').primary();
  table.integer('labelId').notNullable();
  table.string('emailId', SMALL_STRING_SIZE).notNullable();
  table
    .foreign('labelId')
    .references('id')
    .inTable(Table.LABEL);
  table
    .foreign('emailId')
    .references('id')
    .inTable(Table.EMAIL);
  table.unique(['emailId', 'labelId']);
};

const createEmailContactColumns = table => {
  table.increments('id').primary();
  table.integer('contactId').notNullable();
  table.string('emailId', SMALL_STRING_SIZE).notNullable();
  table.string('type', TINY_STRING_SIZE).notNullable();
  table
    .foreign('contactId')
    .references('id')
    .inTable(Table.CONTACT);
  table
    .foreign('emailId')
    .references('id')
    .inTable(Table.EMAIL);
};

const createFileColumns = table => {
  table.string('token', SMALL_STRING_SIZE).primary();
  table.string('name', SMALL_STRING_SIZE).notNullable();
  table.integer('size').notNullable();
  table.integer('status').notNullable();
  table.dateTime('date').notNullable();
  table.string('emailId', SMALL_STRING_SIZE).notNullable();
  table
    .foreign('emailId')
    .references('id')
    .inTable(Table.EMAIL);
};

const createOpenColumns = table => {
  table.increments('id').primary();
  table.string('location', SMALL_STRING_SIZE).notNullable();
  table.integer('type').notNullable();
  table.dateTime('date').notNullable();
  table.string('fileId', SMALL_STRING_SIZE).notNullable();
  table
    .foreign('fileId')
    .references('token')
    .inTable(Table.FILE);
};

const createAccountColumns = table => {
  table.string('recipientId', XSMALL_STRING_SIZE).primary();
  table.integer('deviceId').notNullable();
  table.string('name', MEDIUM_STRING_SIZE).notNullable();
  table.string('jwt', XLARGE_STRING_SIZE).notNullable();
  table.integer('registrationId').notNullable();
  table.string('privKey', LARGE_STRING_SIZE).notNullable();
  table.string('pubKey', LARGE_STRING_SIZE).notNullable();
  table
    .boolean('opened')
    .notNullable()
    .defaultTo(false);
};

const createFeedColumns = table => {
  table.increments('id').primary();
  table.string('username', MEDIUM_STRING_SIZE).notNullable();
  table.boolean('isFile').notNullable();
  table.string('fileId', MEDIUM_STRING_SIZE);
  table.string('action', XSMALL_STRING_SIZE).notNullable();
  table.dateTime('date').notNullable();
  table.boolean('unread').notNullable();
  table.string('emailId', MEDIUM_STRING_SIZE).notNullable();
};

const createPreKeyRecordColumns = table => {
  table
    .integer('preKeyId')
    .primary()
    .notNullable();
  table.string('preKeyPrivKey', LARGE_STRING_SIZE).notNullable();
  table.string('preKeyPubKey', LARGE_STRING_SIZE).notNullable();
};

const createSignedPreKeyRecordColumns = table => {
  table
    .integer('signedPreKeyId')
    .primary()
    .notNullable();
  table.string('signedPreKeyPrivKey', LARGE_STRING_SIZE).notNullable();
  table.string('signedPreKeyPubKey', LARGE_STRING_SIZE).notNullable();
};

const createSessionRecordColumns = table => {
  table.string('recipientId', XSMALL_STRING_SIZE).notNullable();
  table.integer('deviceId').notNullable();
  table.text('record').notNullable();
  table.primary(['recipientId', 'deviceId']);
};

const createIdentityKeyRecordColumns = table => {
  table.string('recipientId', XSMALL_STRING_SIZE).notNullable();
  table.integer('deviceId').notNullable();
  table.string('identityKey', LARGE_STRING_SIZE).notNullable();
  table.primary(['recipientId', 'deviceId']);
};

const createTables = async () => {
  const emailExists = await db.schema.hasTable(Table.EMAIL);
  if (!emailExists) {
    await db.schema
      .createTable(Table.EMAIL, createEmailColumns)
      .createTable(Table.LABEL, createLabelColumns)
      .createTable(Table.EMAIL_LABEL, createEmailLabelColumns)
      .createTable(Table.CONTACT, createContactColumns)
      .createTable(Table.EMAIL_CONTACT, createEmailContactColumns)
      .createTable(Table.FILE, createFileColumns)
      .createTable(Table.OPEN, createOpenColumns)
      .createTable(Table.FEED, createFeedColumns)
      .createTable(Table.ACCOUNT, createAccountColumns)
      .createTable(Table.PREKEYRECORD, createPreKeyRecordColumns)
      .createTable(Table.SIGNEDPREKEYRECORD, createSignedPreKeyRecordColumns)
      .createTable(Table.SESSIONRECORD, createSessionRecordColumns)
      .createTable(Table.IDENTITYKEYRECORD, createIdentityKeyRecordColumns);
  }
};

module.exports = {
  db,
  cleanDataBase,
  createTables,
  Table
};
