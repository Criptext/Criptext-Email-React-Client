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
  OPEN: 'open'
};

const db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: myDBPath
  },
  useNullAsDefault: true
});

const cleanDataBase = () => {
  return db.schema
    .dropTableIfExists(Table.EMAIL)
    .dropTableIfExists(Table.LABEL)
    .dropTableIfExists(Table.EMAIL_LABEL)
    .dropTableIfExists(Table.USER)
    .dropTableIfExists(Table.EMAIL_USER)
    .dropTableIfExists(Table.FILE)
    .dropTableIfExists(Table.OPEN);
};

const createUserColumns = table => {
  table.increments('id').primary();
  table.string('email', MEDIUM_STRING_SIZE);
  table.string('name', MEDIUM_STRING_SIZE);
  table.string('nickname', MEDIUM_STRING_SIZE);
};

const createLabelColumns = table => {
  table.increments('id').primary();
  table.string('text', MEDIUM_STRING_SIZE).unique();
  table.string('color', TINY_STRING_SIZE);
};

const createEmailColumns = table => {
  table.increments('id').primary();
  table.string('key', SHORT_STRING_SIZE).unique();
  table.string('threadId', SHORT_STRING_SIZE);
  table.string('s3Key', SHORT_STRING_SIZE);
  table.text('content');
  table.string('preview', LONG_STRING_SIZE);
  table.string('subject');
  table.dateTime('date');
  table.integer('delivered');
  table.boolean('unread');
  table.boolean('secure');
  table.boolean('isTrash');
  table.boolean('isDraft');
  table.boolean('isMuted');
};

const createEmailLabelColumns = table => {
  table.increments('id').primary();
  table.integer('labelId');
  table.string('emailId', SHORT_STRING_SIZE);
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
  table.integer('userId');
  table.string('emailId', SHORT_STRING_SIZE);
  table.string('type', TINY_STRING_SIZE);
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
  table.string('name', SHORT_STRING_SIZE);
  table.integer('size');
  table.integer('status');
  table.dateTime('date');
  table.string('emailId', SHORT_STRING_SIZE);
  table
    .foreign('emailId')
    .references('id')
    .inTable(Table.EMAIL);
};

const createOpenColumns = table => {
  table.increments('id').primary();
  table.string('location', SHORT_STRING_SIZE);
  table.integer('type');
  table.dateTime('date');
  table.string('fileId', SHORT_STRING_SIZE);
  table
    .foreign('fileId')
    .references('token')
    .inTable(Table.FILE);
};

const createTables = async () => {
  const emailExists = await db.schema.hasTable(Table.EMAIL);
  if (!emailExists) {
    await db.schema.createTable(Table.EMAIL, createEmailColumns);
  }
  const labelExists = await db.schema.hasTable(Table.LABEL);
  if (!labelExists) {
    await db.schema.createTable(Table.LABEL, createLabelColumns);
  }
  const emaiLabelExists = await db.schema.hasTable(Table.EMAIL_LABEL);
  if (!emaiLabelExists) {
    await db.schema.createTable(Table.EMAIL_LABEL, createEmailLabelColumns);
  }
  const userExists = await db.schema.hasTable(Table.USER);
  if (!userExists) {
    await db.schema.createTable(Table.USER, createUserColumns);
  }
  const emailUserExists = await db.schema.hasTable(Table.EMAIL_USER);
  if (!emailUserExists) {
    await db.schema.createTable(Table.EMAIL_USER, createEmailUserColumns);
  }
  const fileExists = await db.schema.hasTable(Table.FILE);
  if (!fileExists) {
    await db.schema.createTable(Table.FILE, createFileColumns);
  }
  const openExists = await db.schema.hasTable(Table.OPEN);
  if (!openExists) {
    await db.schema.createTable(Table.OPEN, createOpenColumns);
  }
};

module.exports = {
  db,
  cleanDataBase,
  createTables,
  Table
};
