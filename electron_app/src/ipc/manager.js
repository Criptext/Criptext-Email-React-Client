const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const dbManager = require('./../database');
const fileUtils = require('./../utils/FileUtils');
const globalManager = require('../globalManager');
const { APP_DOMAIN } = require('../utils/const');
const rekeyHandler = require('../rekeyHandler');
const myAccount = require('../Account');

const getUsername = () => {
  if (!Object.keys(myAccount)) return '';
  if (!myAccount.recipientId) return '';
  return myAccount.email;
};

ipc.answerRenderer('db-delete-emails-by-threadid-and-labelid', async params => {
  const data = params.accountId
    ? params
    : { ...params, accountId: myAccount.id };
  const emailKeys = await dbManager.getEmailsToDeleteByThreadIdAndLabelId(data);
  if (!emailKeys.length) return;
  await Promise.all(
    emailKeys.map(key =>
      fileUtils.deleteEmailContent({
        metadataKey: parseInt(key),
        username: getUsername()
      })
    )
  );
  await dbManager.deleteEmailByKeys({
    keys: emailKeys,
    accountId: params.accountId
  });
});

ipc.answerRenderer('db-clean-database', async username => {
  const user = username
    ? username.includes('@')
      ? username
      : `${username}@${APP_DOMAIN}`
    : getUsername();
  if (user) {
    await fileUtils.removeUserDir(user);
  }
  await dbManager.cleanDataBase();
});

ipc.answerRenderer('db-clean-keys', dbManager.cleanKeys);

ipc.answerRenderer('db-delete-emails-by-ids', async params => {
  const { ids } = params;
  const _accountId = params.accountId || myAccount.id;
  const emails = await dbManager.getEmailsByArrayParam({
    array: { ids },
    accountId: _accountId
  });
  await Promise.all(
    emails.map(email =>
      fileUtils.deleteEmailContent({
        metadataKey: parseInt(email.key),
        username: getUsername()
      })
    )
  );
  await dbManager.deleteEmailsByIds(ids);
});

ipc.answerRenderer('db-get-email-with-body', async key => {
  const [email] = await dbManager.getEmailByKey({ key });
  const body = await fileUtils.getEmailBody({
    username: getUsername(),
    metadataKey: parseInt(key),
    password: globalManager.databaseKey.get()
  });
  if (!body) {
    return email;
  }
  return Object.assign(email, { content: body });
});

ipc.answerRenderer('db-get-emails-by-ids', async params => {
  const { emailIds } = params;
  const _accountId = params.accountId || myAccount.id;
  const emails = await dbManager.getEmailsByIds({
    emailIds,
    accountId: _accountId
  });
  return await Promise.all(
    emails.map(async email => {
      const body = await fileUtils.getEmailBody({
        username: getUsername(),
        metadataKey: parseInt(email.key),
        password: globalManager.databaseKey.get()
      });
      if (!body) {
        return email;
      }
      return Object.assign(email, { content: body });
    })
  );
});

ipc.answerRenderer('db-get-emails-by-threadid', async params => {
  const data = params.accountId
    ? params
    : { ...params, accountId: myAccount.id };
  const emails = await dbManager.getEmailsByThreadId(data);
  return await Promise.all(
    emails.map(async email => {
      const body = await fileUtils.getEmailBody({
        username: getUsername(),
        metadataKey: parseInt(email.key),
        password: globalManager.databaseKey.get()
      });
      if (!body) {
        return email;
      }
      return Object.assign(email, { content: body });
    })
  );
});

ipc.answerRenderer('db-delete-email-by-keys', async params => {
  const data = params.accountId
    ? params
    : { ...params, accountId: myAccount.id };
  const res = await dbManager.deleteEmailByKeys(data);
  await Promise.all(
    params.keys.map(key =>
      fileUtils.deleteEmailContent({
        metadataKey: parseInt(key),
        username: getUsername()
      })
    )
  );
  return res;
});

ipc.answerRenderer('fs-save-email-body', async params => {
  const newParams = Object.assign(params, {
    metadataKey: parseInt(params.metadataKey),
    username: getUsername(),
    password: globalManager.databaseKey.get()
  });
  await fileUtils.saveEmailBody(newParams);
});

ipc.answerRenderer('fs-delete-email-content', async params => {
  const newParams = Object.assign(params, {
    metadataKey: parseInt(params.metadataKey),
    username: getUsername()
  });
  await fileUtils.deleteEmailContent(newParams);
});

ipc.answerRenderer('db-create-email', async params => {
  const data = params.accountId
    ? params
    : { ...params, accountId: myAccount.id };
  await fileUtils.saveEmailBody({
    body: params.body,
    headers: params.headers,
    metadataKey: parseInt(params.email.key),
    username: getUsername(),
    password: globalManager.databaseKey.get()
  });
  return await dbManager.createEmail(data);
});

ipc.answerRenderer('db-unsend-email', async params => {
  const data = params.accountId
    ? params
    : { ...params, accountId: myAccount.id };
  await dbManager.updateEmail(data);
  await fileUtils.deleteEmailContent({ metadataKey: parseInt(params.key) });
});

ipc.answerRenderer('reset-key-initialize', params => {
  rekeyHandler.initialize(params);
});

ipc.answerRenderer('reset-key-start', () => {
  rekeyHandler.start();
});
