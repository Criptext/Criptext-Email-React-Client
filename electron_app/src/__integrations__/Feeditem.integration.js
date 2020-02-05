/* eslint-env node, jest */
const DBManager = require('../database');

const email = {
  email: {
    threadId: 'threadC',
    key: '3',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2018-06-14 08:23:19.120',
    status: 0,
    unread: true,
    secure: true,
    unsentDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdC',
    fromAddress: 'User A <usera@criptext.com>'
  },
  recipients: {
    from: ['User A <usera@criptext.com>'],
    to: ['user@criptext.com', 'userb@criptext.com']
  },
  labels: [1],
  files: [
    {
      token: 'tokenC',
      name: 'Criptext_Image_2018_06_14.png',
      size: 183241,
      status: 1,
      date: '2018-06-14T23:45:57.466Z',
      mimeType: 'image/png',
      key: 'fileKeyA',
      iv: 'fileIvA'
    }
  ]
};

const feeditem = {
  date: '2018-06-14 08:23:19.120',
  type: 7,
  emailId: 1,
  contactId: 1
};

const feeditem2 = {
  date: '2018-06-14 08:23:19.120',
  type: 7,
  emailId: 1,
  contactId: 2
};

const insertEmail = async () => {
  await DBManager.createEmail(email);
};

beforeAll(async () => {
  await DBManager.deleteDatabase();
  await DBManager.initDatabaseEncrypted({
    key: '1111',
    shouldAddSystemLabels: true
  });
  await insertEmail();
});

describe('Store data fedditem to Feeditem Table:', () => {
  it('Should insert feeditem', async () => {
    const feeditemCreated = await DBManager.createFeedItem(feeditem);
    expect(feeditemCreated).toMatchSnapshot();
  });
});

describe('Load data feeditem from Feeditem Table:', () => {
  it('Should load all feeditems', async () => {
    await DBManager.createFeedItem(feeditem2);
    const feeditems = await DBManager.getAllFeedItems();
    expect(feeditems.length).toBe(2);
    expect(feeditems[0]).toMatchSnapshot();
  });

  it('Should load feeditem counter by seen', async () => {
    const badge = await DBManager.getFeedItemsCounterBySeen();
    expect(badge).toBe(2);
    const badge_ = await DBManager.getFeedItemsCounterBySeen(true);
    expect(badge_).toBe(0);
  });
});

describe('Update data feeditem to File Table:', () => {
  it('Should update feeditem: status', async () => {
    const result = await DBManager.updateFeedItems({ ids: [1, 2], seen: true });
    expect(result).toEqual([2]);
    const result_ = await DBManager.updateFeedItems({
      ids: [3, 4],
      seen: true
    });
    expect(result_).toEqual([0]);
  });
});

describe('Delete data fedditem to Feeditem Table:', () => {
  it('Should delete feeditem by id', async () => {
    const result = await DBManager.deleteFeedItemById(1);
    expect(result).toBe(1);
  });

  it('Should not delete feeditem by id that not exists', async () => {
    const result = await DBManager.deleteFeedItemById(3);
    expect(result).toBe(0);
  });
});
