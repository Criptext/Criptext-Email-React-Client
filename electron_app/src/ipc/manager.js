const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const dbManager = require('./../database');
const fileUtils = require('./../utils/FileUtils');
const myAccount = require('../../src/Account');
const globalManager = require('../globalManager');
const { APP_DOMAIN } = require('../utils/const');
const rekeyHandler = require('../rekeyHandler');

const getUsername = () => {
  if (!Object.keys(myAccount)) return '';
  if (!myAccount.recipientId) return '';
  const username = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${APP_DOMAIN}`;
  return username;
};

ipc.answerRenderer(
  'db-delete-emails-by-threadid-and-labelid',
  async ({ threadIds, labelId }) => {
    const emailKeys = await dbManager.getEmailsToDeleteByThreadIdAndLabelId(
      threadIds,
      labelId
    );
    if (emailKeys.lenght) {
      await Promise.all(
        emailKeys.map(key =>
          fileUtils.deleteEmailContent({
            metadataKey: parseInt(key),
            username: getUsername()
          })
        )
      );
      await dbManager.deleteEmailByKeys(emailKeys);
    }
    await dbManager.deleteEmailsByThreadIdAndLabelId(threadIds, labelId);
  }
);

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

ipc.answerRenderer('db-delete-emails-by-ids', async emailIds => {
  const emails = await dbManager.getEmailsByArrayParam({ ids: emailIds });
  await Promise.all(
    emails.map(email =>
      fileUtils.deleteEmailContent({
        metadataKey: parseInt(email.key),
        username: getUsername()
      })
    )
  );
  await dbManager.deleteEmailsByIds(emailIds);
});

ipc.answerRenderer('db-get-email-with-body', async key => {
  const [email] = await dbManager.getEmailByKey(key);
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

ipc.answerRenderer('db-get-emails-by-ids', async emailIds => {
  const emails = await dbManager.getEmailsByIds(emailIds);
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

ipc.answerRenderer('db-get-emails-by-threadid', async threadId => {
  const emails = await dbManager.getEmailsByThreadId(threadId);
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

ipc.answerRenderer('db-delete-email-by-keys', async keys => {
  const res = await dbManager.deleteEmailByKeys(keys);
  await Promise.all(
    keys.map(key =>
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
  await fileUtils.saveEmailBody({
    body: params.body,
    headers: params.headers,
    metadataKey: parseInt(params.email.key),
    username: getUsername(),
    password: globalManager.databaseKey.get()
  });
  return await dbManager.createEmail(params);
});

ipc.answerRenderer('db-unsend-email', async params => {
  await dbManager.updateEmail(params);
  await fileUtils.deleteEmailContent({ metadataKey: parseInt(params.key) });
});

ipc.answerRenderer('upgrade-account', async ({ account, keyBundle }) => {
  const clientManager = require('./../clientManager');
  const res = await clientManager.upgradeAccount(keyBundle);
  if (res.status !== 200) {
    return false;
  }
  const { token, refreshToken, deviceId } = res.body;
  await dbManager.updateAccount({
    ...account,
    refreshToken,
    jwt: token,
    deviceId
  });
  globalManager.needsUpgrade.disable();
  globalManager.windowsEvents.enable();
  return true;
});

ipc.answerRenderer('reset-key-initialize', params => {
  rekeyHandler.initialize(params);
});

ipc.answerRenderer('reset-key-start', () => {
  rekeyHandler.start();
});
