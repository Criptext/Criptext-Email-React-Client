const dbManager = require('./../database');
const pinWindow = require('./pin');
const { generateEvent } = require('./../clientManager');

const upStepDBEncryptedWithoutPIN = async () => {
  const [existingAccount] = await dbManager.getAccount();
  if (existingAccount) {
    await pinWindow.show();
  }
};

const sendAPIevent = async (event) => {
  await generateEvent(event);
}

module.exports = {
  dbManager,
  sendAPIevent,
  upStepDBEncryptedWithoutPIN
};
