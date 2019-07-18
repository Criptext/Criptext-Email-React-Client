/* eslint-env node, jest */

jest.setTimeout(10000);

const DBManager = require('../DBManager');
const fileUtils = require('../utils/FileUtils');
const {
  closeDatabaseConnection,
  createDatabaseConnection,
  decryptStreamFile,
  encryptStreamFile,
  exportContactTable,
  exportLabelTable,
  exportEmailTable,
  exportEmailContactTable,
  exportEmailLabelTable,
  exportFileTable,
  exportDatabaseToFile,
  generateKeyAndIv,
  importDatabaseFromFile
} = require('./../dbExporter');
const fs = require('fs');
const myAccount = require('../Account');
const { APP_DOMAIN } = require('../utils/const');

const DATABASE_PATH = `${__dirname}/test.db`;
const PARSED_SAMPLE_FILEPATH = `${__dirname}/parsed_sample_file.txt`;
const TEMP_DIRECTORY = '/tmp/criptext-tests';

const username = `${myAccount.recipientId}@${APP_DOMAIN}`;

const contacts = [
  {
    name: 'Alice',
    email: 'alice@criptext.com',
    isTrusted: false
  },
  {
    name: 'Bob',
    email: 'bob@criptext.com',
    isTrusted: false
  },
  {
    name: 'Charlie',
    email: 'charlie@criptext.com',
    isTrusted: false
  }
];

const labels = [
  {
    text: 'Sent',
    color: '000000',
    uuid: '00000000-0000-0000-0000-000000000001'
  },
  {
    text: 'Starred',
    color: '111111',
    uuid: '00000000-0000-0000-0000-000000000002'
  }
];

const email = {
  email: {
    threadId: 'threadA',
    key: '1',
    s3Key: 's3KeyA',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2013-10-07 08:23:19',
    status: 2,
    unread: false,
    secure: true,
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20',
    trashDate: null,
    messageId: 'messageId1',
    fromAddress: 'Alice <alice@criptext.com>',
    replyTo: ''
  },
  recipients: {
    from: ['Alice <alice@criptext.com>'],
    to: ['bob@criptext.com', 'charlie@criptext.com'],
    cc: [],
    bcc: []
  },
  labels: [1, 2]
};

const file = {
  id: 1,
  token: 'token1',
  name: 'Criptext_Image_2018_09_03.png',
  readOnly: false,
  size: 183241,
  status: 1,
  date: '2018-09-03 18:45:57',
  emailId: '1',
  mimeType: 'image/png',
  key: 'fileKeyA',
  iv: 'fileIvA'
};

let dbConnection;

const insertContacts = async params => {
  await DBManager.createContact(params);
};

const insertLabels = async params => {
  await DBManager.createLabel(params);
};

const insertEmail = async params => {
  fileUtils.saveEmailBody({
    metadataKey: params.key,
    username,
    body: params.content
  });
  await DBManager.createEmail(params);
};

const insertFile = async params => {
  await DBManager.createFile(params);
};

const createTempDirectory = () => {
  try {
    fs.statSync(TEMP_DIRECTORY);
  } catch (e) {
    fs.mkdirSync(TEMP_DIRECTORY);
  }
};

const cleanTempDirectory = () => {
  if (fs.existsSync(TEMP_DIRECTORY)) {
    fs.readdirSync(TEMP_DIRECTORY).forEach(file => {
      const currentPath = TEMP_DIRECTORY + '/' + file;
      if (fs.lstatSync(currentPath).isDirectory()) {
        cleanTempDirectory(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(TEMP_DIRECTORY);
  }
};

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
});

beforeEach(async () => {
  await fileUtils.removeUserDir(username);
  await DBManager.cleanDataBase();
  await DBManager.createTables();
});

afterAll(() => {
  fileUtils.removeUserDir(username);
  cleanTempDirectory();
  closeDatabaseConnection(dbConnection);
});

const insertValuesToDatabase = async () => {
  await insertContacts(contacts);
  await insertLabels(labels);
  await insertEmail(email);
  await insertFile(file);
};

describe('Parse database: ', () => {
  dbConnection = createDatabaseConnection(DATABASE_PATH);

  it('Should parse Contacts to string', async () => {
    await insertContacts(contacts);
    const expectedString =
      `{"table":"contact","object":{"id":1,"email":"alice@criptext.com","name":"Alice","isTrusted":false,"spamScore":0}}\n` +
      `{"table":"contact","object":{"id":2,"email":"bob@criptext.com","name":"Bob","isTrusted":false,"spamScore":0}}\n` +
      `{"table":"contact","object":{"id":3,"email":"charlie@criptext.com","name":"Charlie","isTrusted":false,"spamScore":0}}`;
    const contactsString = await exportContactTable(dbConnection);
    expect(contactsString).toBe(expectedString);
  });

  it('Should parse Labels to string', async () => {
    await insertLabels(labels);
    const expectedString =
      `{"table":"label","object":{"id":1,"text":"Sent","color":"000000","type":"custom","visible":true,"uuid":"00000000-0000-0000-0000-000000000001"}}\n` +
      `{"table":"label","object":{"id":2,"text":"Starred","color":"111111","type":"custom","visible":true,"uuid":"00000000-0000-0000-0000-000000000002"}}`;
    const labelsString = await exportLabelTable(dbConnection);
    expect(labelsString).toBe(expectedString);
  });

  it('Should parse Emails to string', async () => {
    await insertEmail(email);
    const expectedString = `{"table":"email","object":{"id":1,"key":1,"threadId":"threadA","s3Key":"s3KeyA","subject":"Greetings","content":"<p>Hello there</p>","preview":"Hello there","date":"2013-10-07 08:23:19","status":2,"unread":false,"secure":true,"isMuted":false,"messageId":"messageId1","fromAddress":"Alice <alice@criptext.com>","replyTo":"","unsentDate":"2018-06-14 08:23:20"}}`;
    const expectedJSON = JSON.parse(expectedString);
    const emailsString = await exportEmailTable(dbConnection);
    const emailsJSON = JSON.parse(emailsString);
    expect(emailsJSON).toMatchObject(expect.objectContaining(expectedJSON));
  });

  it('Should parse relation EmailContact to string', async () => {
    await insertEmail(email);
    const expectedString =
      `{"table":"email_contact","object":{"id":1,"contactId":1,"emailId":1,"type":"from"}}\n` +
      `{"table":"email_contact","object":{"id":2,"contactId":2,"emailId":1,"type":"to"}}\n` +
      `{"table":"email_contact","object":{"id":3,"contactId":3,"emailId":1,"type":"to"}}`;
    const emailContactsString = await exportEmailContactTable(dbConnection);
    expect(emailContactsString).toBe(expectedString);
  });

  it('Should parse relation EmailLabel to string', async () => {
    await insertEmail(email);
    const expectedString =
      `{"table":"email_label","object":{"id":1,"labelId":1,"emailId":1}}\n` +
      `{"table":"email_label","object":{"id":2,"labelId":2,"emailId":1}}`;
    const emaillabelsString = await exportEmailLabelTable(dbConnection);
    expect(emaillabelsString).toBe(expectedString);
  });

  it('Should parse Files to string', async () => {
    await insertEmail(email);
    await insertFile(file);
    const expectedString = `{"table":"file","object":{"id":1,"token":"token1","name":"Criptext_Image_2018_09_03.png","readOnly":false,"size":183241,"status":1,"date":"2018-09-03 18:45:57","mimeType":"image/png","ephemeral":0,"ephemeralStart":0,"ephemeralTime":0,"emailId":1,"key":"fileKeyA","iv":"fileIvA"}}`;
    const filesString = await exportFileTable(dbConnection);
    expect(filesString).toBe(expectedString);
  });
});

describe('Encrypt and Decrypt: ', () => {
  createTempDirectory();
  const { key, iv } = generateKeyAndIv();

  it('Should save database to file: ', async () => {
    const outputPath = `${TEMP_DIRECTORY}/parsed_output.txt`;
    await DBManager.cleanDataBase();
    await DBManager.createTables();
    await insertValuesToDatabase();
    await exportDatabaseToFile({
      databasePath: DATABASE_PATH,
      outputPath
    });
    const sampleFile = fs.readFileSync(PARSED_SAMPLE_FILEPATH);
    const resultFile = fs.readFileSync(outputPath);
    expect(resultFile.equals(sampleFile)).toBe(true);
  });

  it('Should encrypted a parsed file and then decrypt it: ', async () => {
    const encryptedOutputFilepath = `${TEMP_DIRECTORY}/encrypted_output.txt`;
    const decryptedOutputFilepath = `${TEMP_DIRECTORY}/decrypted_output.txt`;
    await encryptStreamFile({
      inputFile: PARSED_SAMPLE_FILEPATH,
      outputFile: encryptedOutputFilepath,
      key,
      iv
    });
    await decryptStreamFile({
      inputFile: encryptedOutputFilepath,
      outputFile: decryptedOutputFilepath,
      key
    });
    const sampleFile = fs.readFileSync(PARSED_SAMPLE_FILEPATH);
    const resultFile = fs.readFileSync(decryptedOutputFilepath);
    expect(resultFile.equals(sampleFile)).toBe(true);
  });
});

describe('Import Database: ', () => {
  it('Should save file data in database', async () => {
    await importDatabaseFromFile({
      filepath: PARSED_SAMPLE_FILEPATH,
      databasePath: DATABASE_PATH
    });
    const [emailChecked1] = await DBManager.getEmailsByThreadIdAndLabelId(
      [email.email.threadId],
      email.labels[0]
    );
    const [emailChecked2] = await DBManager.getEmailsByThreadIdAndLabelId(
      [email.email.threadId],
      email.labels[1]
    );
    const [rawEmail] = await DBManager.getEmailsByThreadId(
      email.email.threadId
    );

    const body =
      (await fileUtils.getEmailBody({
        username,
        metadataKey: email.email.key
      })) || rawEmail.content;
    const emailImported = {
      ...rawEmail,
      content: body
    };
    const { fileTokens } = emailImported;
    const contactIds = [
      ...emailImported.fromContactIds.split(',').map(Number),
      ...emailImported.to.split(',').map(Number)
    ];
    const [fileImported] = await DBManager.getFilesByTokens([fileTokens]);

    let [
      firstContact,
      secondContact,
      thirdContact
    ] = await DBManager.getContactByIds(contactIds);
    firstContact = { ...firstContact, isTrusted: !!firstContact.isTrusted };
    secondContact = { ...secondContact, isTrusted: !!secondContact.isTrusted };
    thirdContact = { ...thirdContact, isTrusted: !!thirdContact.isTrusted };

    const emailResult = {
      ...emailImported,
      isMuted: !!emailImported.isMuted,
      secure: !!emailImported.secure,
      unread: !!emailImported.unread
    };
    const fileResult = {
      ...fileImported,
      readOnly: !!fileImported.readOnly
    };
    const same =
      emailChecked1.id === emailChecked2.id && emailChecked1.id === rawEmail.id;
    expect(same).toBe(true);
    expect(emailResult).toMatchObject(expect.objectContaining(email.email));
    expect(fileResult).toMatchObject(file);
    expect(firstContact).toMatchObject(contacts[0]);
    expect(secondContact).toMatchObject(contacts[1]);
    expect(thirdContact).toMatchObject(contacts[2]);
  });
});
