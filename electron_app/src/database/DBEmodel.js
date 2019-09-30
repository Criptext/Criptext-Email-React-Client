/* process */
require('dotenv').config();

const Sequelize = require('sequelize');
const { app } = require('electron');
const path = require('path');
const rimraf = require('rimraf');
const Model = Sequelize.Model;
const Op = Sequelize.Op;

let sequelize;

const getDbEncryptPath = node_env => {
  switch (node_env) {
    case 'test': {
      return './src/__integrations__/test.db';
    }
    case 'development': {
      return path
        .join(__dirname, '/CriptextEncrypt.db')
        .replace('/app.asar', '')
        .replace('/src/database', '');
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, '/CriptextEncrypt.db')
        .replace('/app.asar', '')
        .replace('/src/database', '');
    }
  }
};

const myDBEncryptPath = () => getDbEncryptPath(process.env.NODE_ENV);

const deleteDatabase = () => {
  const path = myDBEncryptPath();
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const Table = {
  ACCOUNT: 'account',
  EMAIL: 'email',
  LABEL: 'label',
  EMAIL_LABEL: 'emailLabel',
  CONTACT: 'contact',
  EMAIL_CONTACT: 'emailContact',
  FILE: 'file',
  FILE_KEY: 'fileKey',
  FEEDITEM: 'feeditem',
  MIGRATIONS: 'migrations',
  PREKEYRECORD: 'prekeyrecord',
  SIGNEDPREKEYRECORD: 'signedprekeyrecord',
  SESSIONRECORD: 'sessionrecord',
  IDENTITYKEYRECORD: 'identitykeyrecord',
  PENDINGEVENT: 'pendingEvent',
  SETTINGS: 'settings'
};

class Contact extends Model {}
class Account extends Model {}
class Email extends Model {}
class EmailContact extends Model {}
class Label extends Model {}
class EmailLabel extends Model {}
class Feeditem extends Model {}
class File extends Model {}
class Identitykeyrecord extends Model {}
class Pendingevent extends Model {}
class Prekeyrecord extends Model {}
class Sessionrecord extends Model {}
class Settings extends Model {}
class Signedprekeyrecord extends Model {}

const getDB = () => sequelize;

const setConfiguration = key => {
  sequelize = new Sequelize(null, null, key, {
    dialect: 'sqlite',
    dialectModulePath: '@journeyapps/sqlcipher',
    storage: myDBEncryptPath()
  });
};

const initDatabaseEncrypted = async key => {
  if (sequelize) return;
  await setConfiguration(key);

  Account.init(
    {
      recipientId: { type: Sequelize.STRING, primaryKey: true },
      deviceId: Sequelize.INTEGER,
      name: Sequelize.STRING,
      jwt: Sequelize.STRING,
      refreshToken: Sequelize.STRING,
      registrationId: Sequelize.INTEGER,
      privKey: Sequelize.STRING,
      pubKey: Sequelize.STRING,
      signature: { type: Sequelize.STRING, defaultValue: '' },
      signatureEnabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      encryptToExternals: { type: Sequelize.BOOLEAN, defaultValue: false },
      signFooter: { type: Sequelize.BOOLEAN, defaultValue: true }
    },
    {
      sequelize,
      tableName: Table.ACCOUNT,
      freezeTableName: true,
      timestamps: false
    }
  );

  Contact.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: Sequelize.STRING,
      name: Sequelize.STRING,
      isTrusted: { type: Sequelize.BOOLEAN, defaultValue: false },
      score: { type: Sequelize.INTEGER, defaultValue: 0 },
      spamScore: { type: Sequelize.INTEGER, defaultValue: 0 }
    },
    {
      sequelize,
      tableName: Table.CONTACT,
      freezeTableName: true,
      timestamps: false
    }
  );

  Email.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      key: Sequelize.STRING,
      threadId: Sequelize.STRING,
      s3Key: Sequelize.STRING,
      subject: Sequelize.STRING,
      content: Sequelize.STRING,
      preview: Sequelize.STRING,
      date: Sequelize.DATE,
      status: Sequelize.INTEGER,
      unread: Sequelize.BOOLEAN,
      secure: Sequelize.BOOLEAN,
      unsentDate: Sequelize.DATE,
      trashDate: Sequelize.DATE,
      messageId: Sequelize.STRING,
      replyTo: Sequelize.STRING,
      fromAddress: { type: Sequelize.STRING, defaultValue: '' },
      boundary: Sequelize.STRING
    },
    {
      sequelize,
      tableName: Table.EMAIL,
      freezeTableName: true,
      timestamps: false
    }
  );

  Label.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      text: Sequelize.STRING,
      color: Sequelize.STRING,
      type: { type: Sequelize.STRING, defaultValue: 'custom' },
      visible: { type: Sequelize.BOOLEAN, defaultValue: true },
      uuid: Sequelize.STRING
    },
    {
      sequelize,
      tableName: Table.LABEL,
      freezeTableName: true,
      timestamps: false
    }
  );

  EmailContact.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      type: Sequelize.STRING
    },
    {
      sequelize,
      tableName: Table.EMAIL_CONTACT,
      freezeTableName: true,
      timestamps: false
    }
  );

  Contact.hasMany(EmailContact, { foreignKey: 'contactId' });
  Email.hasMany(EmailContact, { foreignKey: 'emailId' });

  EmailLabel.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }
    },
    {
      sequelize,
      tableName: Table.EMAIL_LABEL,
      freezeTableName: true,
      timestamps: false
    }
  );

  Label.hasMany(EmailLabel, { foreignKey: 'labelId' });
  Email.hasMany(EmailLabel, { foreignKey: 'emailId' });

  File.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      token: Sequelize.STRING,
      name: Sequelize.STRING,
      size: Sequelize.INTEGER,
      status: Sequelize.INTEGER,
      date: Sequelize.DATE,
      mimeType: Sequelize.STRING,
      key: Sequelize.STRING,
      iv: Sequelize.STRING,
      cid: Sequelize.STRING
    },
    {
      sequelize,
      tableName: Table.FILE,
      freezeTableName: true,
      timestamps: false
    }
  );

  File.belongsTo(Email, { foreignKey: 'emailId' });

  Feeditem.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      date: Sequelize.DATE,
      type: Sequelize.INTEGER,
      seen: { type: Sequelize.BOOLEAN, defaultValue: false }
    },
    {
      sequelize,
      tableName: Table.FEEDITEM,
      freezeTableName: true,
      timestamps: false
    }
  );

  Feeditem.belongsTo(Email, { foreignKey: 'emailId' });
  Feeditem.belongsTo(Contact, { foreignKey: 'contactId' });
  Feeditem.belongsTo(File, { foreignKey: 'fileId' });

  Identitykeyrecord.init(
    {
      recipientId: { type: Sequelize.STRING, primaryKey: true },
      deviceId: { type: Sequelize.INTEGER, primaryKey: true },
      identityKey: Sequelize.STRING
    },
    {
      sequelize,
      tableName: Table.IDENTITYKEYRECORD,
      freezeTableName: true,
      timestamps: false
    }
  );

  Pendingevent.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      data: Sequelize.STRING
    },
    {
      sequelize,
      tableName: Table.PENDINGEVENT,
      freezeTableName: true,
      timestamps: false
    }
  );

  Prekeyrecord.init(
    {
      preKeyId: { type: Sequelize.INTEGER, primaryKey: true },
      record: Sequelize.STRING,
      recordLength: Sequelize.INTEGER
    },
    {
      sequelize,
      tableName: Table.PREKEYRECORD,
      freezeTableName: true,
      timestamps: false
    }
  );

  Sessionrecord.init(
    {
      recipientId: { type: Sequelize.STRING, primaryKey: true },
      deviceId: { type: Sequelize.INTEGER, primaryKey: true },
      record: Sequelize.STRING,
      recordLength: Sequelize.INTEGER
    },
    {
      sequelize,
      tableName: Table.SESSIONRECORD,
      freezeTableName: true,
      timestamps: false
    }
  );

  Settings.init(
    {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      language: { type: Sequelize.STRING, defaultValue: 'en' },
      opened: { type: Sequelize.BOOLEAN, defaultValue: false },
      theme: { type: Sequelize.STRING, defaultValue: 'light' },
      autoBackupEnable: { type: Sequelize.BOOLEAN, defaultValue: false },
      autoBackupFrequency: Sequelize.STRING,
      autoBackupLastDate: Sequelize.DATE,
      autoBackupLastSize: Sequelize.INTEGER,
      autoBackupNextDate: Sequelize.DATE,
      autoBackupPath: Sequelize.STRING
    },
    {
      sequelize,
      tableName: Table.SETTINGS,
      freezeTableName: true,
      timestamps: false
    }
  );

  Signedprekeyrecord.init(
    {
      signedPreKeyId: { type: Sequelize.INTEGER, primaryKey: true },
      record: Sequelize.STRING,
      recordLength: Sequelize.INTEGER
    },
    {
      sequelize,
      tableName: Table.SIGNEDPREKEYRECORD,
      freezeTableName: true,
      timestamps: false
    }
  );

  await sequelize.sync({});
};

const resetKeyDatabase = async key => {
  return await sequelize.query(`PRAGMA rekey = "${key}";`);
};

const hasTable = async () => {
  try {
    return await sequelize
      .query("select name from sqlite_master where type='table'")
      .then(([results]) => {
        return !!results.length;
      });
  } catch (error) {
    throw new Error('Connection error');
  }
};

module.exports = {
  Account: () => Account,
  Contact: () => Contact,
  Email: () => Email,
  EmailContact: () => EmailContact,
  EmailLabel: () => EmailLabel,
  Feeditem: () => Feeditem,
  Label: () => Label,
  File: () => File,
  Identitykeyrecord: () => Identitykeyrecord,
  Pendingevent: () => Pendingevent,
  Prekeyrecord: () => Prekeyrecord,
  Sessionrecord: () => Sessionrecord,
  Settings: () => Settings,
  Signedprekeyrecord: () => Signedprekeyrecord,
  deleteDatabase,
  getDB,
  initDatabaseEncrypted,
  Op,
  resetKeyDatabase,
  Table
};
