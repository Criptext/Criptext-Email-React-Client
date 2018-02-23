const path = require('path');
const DB_TEST_PATH = './src/__integrations__/test.db';
const DB_PATH = path
  .join(__dirname, '/mydb.db')
  .replace('/app.asar', '')
  .replace('/src', '');
const myDBPath = process.env.NODE_ENV === 'test' ? DB_TEST_PATH : DB_PATH;
const MEDIUM_STRING_SIZE = 64;
const SHORT_STRING_SIZE = 32;
const TINY_STRING_SIZE = 10;
const LONG_STRING_SIZE = 100;

const Table = {
  EMAIL: 'email',
  LABEL: 'label',
  EMAIL_LABEL: 'emailLabel',
  USER: 'user',
  EMAIL_USER: 'emailUser',
  FILE: 'file',
  OPEN: 'open',
  SESSION: 'session'
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
    .dropTableIfExists(Table.USER)
    .dropTableIfExists(Table.EMAIL_USER)
    .dropTableIfExists(Table.FILE)
    .dropTableIfExists(Table.OPEN)
    .dropTableIfExists(Table.SESSION);
};

const createUserColumns = table => {
  table.increments('id').primary();
  table.string('recoveryEmail', MEDIUM_STRING_SIZE);
  table.string('name', MEDIUM_STRING_SIZE).notNullable();
  table.string('username', MEDIUM_STRING_SIZE).notNullable();
};

const createLabelColumns = table => {
  table.increments('id').primary();
  table
    .string('text', MEDIUM_STRING_SIZE)
    .unique()
    .notNullable();
  table.string('color', TINY_STRING_SIZE).notNullable();
};

const createEmailColumns = table => {
  table.increments('id').primary();
  table
    .string('key', SHORT_STRING_SIZE)
    .unique()
    .notNullable();
  table.string('threadId', SHORT_STRING_SIZE).notNullable();
  table.string('s3Key', SHORT_STRING_SIZE).notNullable();
  table.text('content').notNullable();
  table.string('preview', LONG_STRING_SIZE).notNullable();
  table.string('subject').notNullable();
  table.dateTime('date').notNullable();
  table.integer('delivered').notNullable();
  table.boolean('unread').notNullable();
  table.boolean('secure').notNullable();
  table.boolean('isTrash').notNullable();
  table.boolean('isDraft').notNullable();
  table.boolean('isMuted').notNullable();
};

const createEmailLabelColumns = table => {
  table.increments('id').primary();
  table.integer('labelId').notNullable();
  table.string('emailId', SHORT_STRING_SIZE).notNullable();
  table
    .foreign('labelId')
    .references('id')
    .inTable(Table.LABEL);
  table
    .foreign('emailId')
    .references('id')
    .inTable(Table.EMAIL);
};

const createEmailUserColumns = table => {
  table.increments('id').primary();
  table.integer('userId').notNullable();
  table.string('emailId', SHORT_STRING_SIZE).notNullable();
  table.string('type', TINY_STRING_SIZE).notNullable();
  table
    .foreign('userId')
    .references('id')
    .inTable(Table.USER);
  table
    .foreign('emailId')
    .references('id')
    .inTable(Table.EMAIL);
};

const createFileColumns = table => {
  table.string('token', SHORT_STRING_SIZE).primary();
  table.string('name', SHORT_STRING_SIZE).notNullable();
  table.integer('size').notNullable();
  table.integer('status').notNullable();
  table.dateTime('date').notNullable();
  table.string('emailId', SHORT_STRING_SIZE).notNullable();
  table
    .foreign('emailId')
    .references('id')
    .inTable(Table.EMAIL);
};

const createOpenColumns = table => {
  table.increments('id').primary();
  table.string('location', SHORT_STRING_SIZE).notNullable();
  table.integer('type').notNullable();
  table.dateTime('date').notNullable();
  table.string('fileId', SHORT_STRING_SIZE).notNullable();
  table
    .foreign('fileId')
    .references('token')
    .inTable(Table.FILE);
};

const createSessionUserColumns = table => {
  table.increments('id').primary();
  table.string('sessionId', TINY_STRING_SIZE).notNullable();
  table.string('username', MEDIUM_STRING_SIZE).notNullable();
}

const cleanSession = () => {
  return db.schema.dropTableIfExists(Table.SESSION);
};

const createTables = async () => {
  const emailExists = await db.schema.hasTable(Table.EMAIL);
  if (!emailExists) {
    await db.schema
      .createTable(Table.EMAIL, createEmailColumns)
      .createTable(Table.LABEL, createLabelColumns)
      .createTable(Table.EMAIL_LABEL, createEmailLabelColumns)
      .createTable(Table.USER, createUserColumns)
      .createTable(Table.EMAIL_USER, createEmailUserColumns)
      .createTable(Table.FILE, createFileColumns)
      .createTable(Table.OPEN, createOpenColumns)
      .createTable(Table.SESSION, createSessionUserColumns);
  }
};

module.exports = {
  db,
  cleanDataBase,
  cleanSession,
  createTables,
  Table
};
