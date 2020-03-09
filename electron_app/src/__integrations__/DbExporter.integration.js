/* eslint-env node, jest */

jest.setTimeout(10000);

const DBManager = require('../database');
const fileUtils = require('../utils/FileUtils');
const {
  decryptStreamFile,
  encryptStreamFile,
  exportContactTable,
  exportLabelTable,
  exportEmailTable,
  exportEmailContactTable,
  exportEmailLabelTable,
  exportFileTable,
  exportEncryptDatabaseToFile,
  generateKeyAndIv,
  importDatabaseFromFile
} = require('./../database/DBEexporter');
const globalManager = require('../globalManager');
const fs = require('fs');
const myAccount = require('../Account');

const PARSED_SAMPLE_FILEPATH = `${__dirname}/parsed_sample_file.txt`;
const TEMP_DIRECTORY = '/tmp/criptext-tests';

let accountId;
let username;
const account = {
  recipientId: 'test',
  deviceId: 1,
  name: 'Test User',
  registrationId: 2,
  privKey: 'aaa',
  pubKey: 'bbb',
  isActive: true,
  isLoggedIn: true
};

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
    text: 'News',
    color: '000000',
    uuid: '65a60683-a1c9-21f3-79d5-e57462ca8147'
  },
  {
    text: 'Shop',
    color: '111111',
    uuid: '77b80589-3a4d-171e-a264-e99a07baca27'
  }
];

const email = {
  email: {
    threadId: 'threadA',
    key: '1',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2013-10-07 08:23:19',
    status: 2,
    unread: false,
    secure: true,
    unsentDate: '2018-06-14 08:23:20',
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
  labels: [1, 2],
  files: [
    {
      token: 'token1',
      name: 'Criptext_Image_2018_09_03.png',
      size: 183241,
      status: 1,
      date: '2018-09-03 18:45:57',
      mimeType: 'image/png',
      key: 'fileKeyA',
      iv: 'fileIvA'
    }
  ]
};

const insertAccount = async () => {
  return await DBManager.createAccount(account);
};

const insertContacts = async params => {
  return await DBManager.createContact({ contacts: params, accountId });
};

const insertLabels = async params => {
  return await DBManager.createLabel(
    params.map(label => {
      return { ...label, accountId };
    })
  );
};

const dbKey = '1111';
const insertEmail = async params => {
  fileUtils.saveEmailBody({
    metadataKey: params.email.key,
    username,
    body: params.email.content,
    password: dbKey
  });
  return await DBManager.createEmail({
    ...params,
    accountId
  });
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
  await fileUtils.removeUserDir(username);
  await DBManager.deleteDatabase();
  await DBManager.initDatabaseEncrypted({
    key: dbKey,
    shouldAddSystemLabels: true
  });
  globalManager.databaseKey.set(dbKey);
  const [account] = await insertAccount();
  myAccount.initialize([account.dataValues]);
  accountId = account.dataValues.id;
  username = myAccount.email;
});

afterAll(() => {
  fileUtils.removeUserDir(username);
  cleanTempDirectory();
});

describe('Parse database: ', () => {
  it('Should parse Contacts to string', async () => {
    const result = await insertContacts(contacts);
    expect(result.length).toBe(3);
    const expectedString =
      `{"table":"contact","object":{"id":1,"email":"alice@criptext.com","name":"Alice","isTrusted":false,"spamScore":0}}\n` +
      `{"table":"contact","object":{"id":2,"email":"bob@criptext.com","name":"Bob","isTrusted":false,"spamScore":0}}\n` +
      `{"table":"contact","object":{"id":3,"email":"charlie@criptext.com","name":"Charlie","isTrusted":false,"spamScore":0}}`;
    const contactsString = await exportContactTable(accountId);
    expect(contactsString).toBe(expectedString);
  });

  it('Should parse Labels to string', async () => {
    const result = await insertLabels(labels);
    expect(result.length).toBe(2);
    const expectedString =
      `{"table":"label","object":{"id":8,"text":"News","color":"000000","type":"custom","visible":true,"uuid":"65a60683-a1c9-21f3-79d5-e57462ca8147"}}\n` +
      `{"table":"label","object":{"id":9,"text":"Shop","color":"111111","type":"custom","visible":true,"uuid":"77b80589-3a4d-171e-a264-e99a07baca27"}}`;
    const labelsString = await exportLabelTable(accountId);
    expect(labelsString).toBe(expectedString);
  });

  it('Should parse Emails to string', async () => {
    await insertEmail(email);
    const expectedString = `{"table":"email","object":{"id":1,"key":1,"threadId":"threadA","subject":"Greetings","content":"<p>Hello there</p>","preview":"Hello there","date":"2013-10-07 08:23:19","status":2,"unread":false,"secure":true,"messageId":"messageId1","fromAddress":"Alice <alice@criptext.com>","replyTo":"","unsentDate":"2018-06-14 08:23:20"}}`;
    const expectedJSON = JSON.parse(expectedString);
    const emailsString = await exportEmailTable(accountId);
    const emailsJSON = JSON.parse(emailsString);
    expect(emailsJSON).toMatchObject(expect.objectContaining(expectedJSON));
  });

  it('Should parse relation EmailContact to string', async () => {
    const expectedString =
      `{"table":"email_contact","object":{"id":1,"type":"from","contactId":1,"emailId":1}}\n` +
      `{"table":"email_contact","object":{"id":2,"type":"to","contactId":2,"emailId":1}}\n` +
      `{"table":"email_contact","object":{"id":3,"type":"to","contactId":3,"emailId":1}}`;
    const emailContactsString = await exportEmailContactTable(accountId);
    expect(emailContactsString).toBe(expectedString);
  });

  it('Should parse relation EmailLabel to string', async () => {
    const expectedString =
      `{"table":"email_label","object":{"id":1,"labelId":1,"emailId":1}}\n` +
      `{"table":"email_label","object":{"id":2,"labelId":2,"emailId":1}}`;
    const emaillabelsString = await exportEmailLabelTable(accountId);
    expect(emaillabelsString).toBe(expectedString);
  });

  it('Should parse Files to string', async () => {
    const expectedString = `{"table":"file","object":{"id":1,"token":"token1","name":"Criptext_Image_2018_09_03.png","size":183241,"status":1,"date":"2018-09-03 18:45:57","mimeType":"image/png","key":"fileKeyA","iv":"fileIvA","emailId":1}}`;
    const filesString = await exportFileTable(accountId);
    expect(filesString).toBe(expectedString);
  });
});

describe('Encrypt and Decrypt: ', () => {
  createTempDirectory();
  it('Should save database to file: ', async () => {
    const outputPath = `${TEMP_DIRECTORY}/parsed_output.txt`;
    await exportEncryptDatabaseToFile({
      outputPath
    });
    const sampleFile = fs.readFileSync(PARSED_SAMPLE_FILEPATH);
    const resultFile = fs.readFileSync(outputPath);
    expect(resultFile.equals(sampleFile)).toBe(true);
  });

  it('Should encrypted a parsed file and then decrypt it: ', async () => {
    const { key, iv } = generateKeyAndIv();
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
      isStrict: true
    });
    const [emailChecked1] = await DBManager.getEmailsByThreadIdAndLabelId({
      threadIds: [email.email.threadId],
      labelId: email.labels[0],
      accountId
    });
    const [emailChecked2] = await DBManager.getEmailsByThreadIdAndLabelId({
      threadIds: [email.email.threadId],
      labelId: email.labels[1],
      accountId
    });
    const [rawEmail] = await DBManager.getEmailsByThreadId({
      threadId: email.email.threadId,
      accountId
    });
    const body =
      (await fileUtils.getEmailBody({
        username,
        metadataKey: email.email.key,
        password: dbKey
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
    expect(fileResult).toMatchObject(email.files[0]);
    expect(firstContact).toMatchObject(contacts[0]);
    expect(secondContact).toMatchObject(contacts[1]);
    expect(thirdContact).toMatchObject(contacts[2]);
  });
});
