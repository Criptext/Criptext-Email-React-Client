const DB_TEST_PATH = './src/__tests__/test.db';
const DB_PATH = './src/mydb.db';
const myDBPath = process.env.NODE_ENV === 'test' ? DB_TEST_PATH : DB_PATH;
const MEDIUM_STRING_SIZE = 64;
const SHORT_STRING_SIZE = 32;
const TINY_STRING_SIZE = 10;
const LONG_STRING_SIZE = 100;

const db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: myDBPath
  }
});

const createUserColumns = table => {
  table.string('email').primary();
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
    .inTable('label');
  table
    .foreign('emailId')
    .references('id')
    .inTable('email');
};

const createEmailUserColumns = table => {
  table.increments('id').primary();
  table.integer('userId');
  table.string('emailId', SHORT_STRING_SIZE);
  table.string('type', TINY_STRING_SIZE);
  table
    .foreign('userId')
    .references('id')
    .inTable('user');
  table
    .foreign('emailId')
    .references('id')
    .inTable('email');
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
    .inTable('email');
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
    .inTable('file');
};

const createTables = () => {
  return db.schema
    .createTableIfNotExists('email', createEmailColumns)
    .createTableIfNotExists('label', createLabelColumns)
    .createTableIfNotExists('emailLabel', createEmailLabelColumns)
    .createTableIfNotExists('user', createUserColumns)
    .createTableIfNotExists('emailUser', createEmailUserColumns)
    .createTableIfNotExists('file', createFileColumns)
    .createTableIfNotExists('open', createOpenColumns);
};

module.exports = {
  db,
  createTables
};
