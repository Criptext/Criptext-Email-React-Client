import { labels } from './systemLabels';
const electron = window.require('electron');
const spellChecker = window.require('spellchecker');
const { remote, ipcRenderer, webFrame } = electron;
const composerId = remote.getCurrentWindow().id;
const globalManager = remote.require('./src/globalManager');
export const getAlicePort = remote.require('./src/aliceManager').getPort;
export const getAlicePassword = remote.require('./src/aliceManager')
  .getPassword;

export const {
  FILE_SERVER_APP_ID,
  FILE_SERVER_KEY,
  APP_DOMAIN
} = remote.require('./src/utils/const');

export const getEmailToEdit = () => {
  return globalManager.emailToEdit.get(composerId);
};

const account = remote.require('./src/Account');
export let myAccount = account;
export const loggedAccounts = account.loggedAccounts;
export const setMyAccount = recipientId => {
  myAccount = loggedAccounts.find(
    account => account.recipientId === recipientId
  );
};
export const mySettings = remote.require('./src/Settings');
export const LabelType = labels;

/* Window events
   ----------------------------- */
export const sendEventToMailbox = (name, params) => {
  ipcRenderer.send(name, params);
};

webFrame.setSpellCheckProvider(mySettings.language, {
  spellCheck(words, callback) {
    const checker = new spellChecker.Spellchecker();
    checker.setSpellcheckerType(spellChecker.ALWAYS_USE_HUNSPELL);
    const misspelled = words.filter(x => {
      return checker.isMisspelled(x);
    });
    callback(misspelled);
  }
});
