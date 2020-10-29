import { labels } from './systemLabels';
import lang from './../lang';
const electron = window.require('electron');
const { remote, webFrame } = electron;

export const { requiredMinLength, requiredMaxLength } = remote.require(
  './src/validationConsts'
);
export const { DEFAULT_PIN } = remote.require('./src/utils/const');

export const myAccount = remote.require('./src/Account');
export const mySettings = remote.require('./src/Settings');
export const getAlicePort = remote.require('./src/aliceManager').getPort;
export const LabelType = labels;
export const socketClient = remote.require('./src/socketClient');
const globalManager = remote.require('./src/globalManager');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

export const getPin = () => {
  const globalPin = globalManager.databaseKey.get();
  if (globalPin === DEFAULT_PIN) {
    return '';
  }
  return globalPin;
};

export const createTemporalAccount = accountData => {
  return globalManager.temporalAccount.set(accountData);
};

export const getTemporalAccount = () => {
  return globalManager.temporalAccount.get();
};

export const getLoginInformation = () => {
  return globalManager.loginData.get();
};

export const deleteTemporalAccount = () => {
  return globalManager.temporalAccount.delete();
};

export const hasPin = () => {
  return !!globalManager.databaseKey.get();
};

export const confirmWaitingApprovalLogin = callback => {
  const texts = lang.dialogContent.confirmWaitingApprovalLogin;
  const dialog = remote.dialog;
  const RESPONSES = {
    CANCEL: {
      index: 0,
      label: texts.cancelResponse
    },
    KEEP: {
      index: 1,
      label: texts.keepResponse
    }
  };
  const dialogResponses = Object.values(RESPONSES).map(
    response => response.label
  );
  const dialogTemplate = {
    type: 'warning',
    title: texts.title,
    buttons: dialogResponses,
    defaultId: RESPONSES.KEEP.index,
    cancelId: RESPONSES.CANCEL.index,
    message: texts.message,
    detail: texts.detail,
    noLink: true
  };
  dialog.showMessageBox(dialogTemplate, responseIndex => {
    const response = responseIndex === RESPONSES.KEEP.index;
    callback(response);
  });
};

export const showOpenFileDialog = () => {
  const dialog = remote.dialog;
  return dialog.showOpenDialog(null, {
    filters: {
      extensions: ['jpeg', 'jpg', 'png', 'bitmap']
    }
  });
};

export const setLoginInformation = params => {
  return globalManager.loginData.set(params);
};

export const isFromStore =
  globalManager.isWindowsStore.get() || globalManager.isMAS.get();
