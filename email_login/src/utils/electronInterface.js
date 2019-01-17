import { labels } from './systemLabels';
import lang from './../lang';
const electron = window.require('electron');
const { remote, webFrame } = electron;

export const { requiredMinLength, requiredMaxLength } = remote.require(
  './src/validationConsts'
);
export const errors = remote.require('./src/errors');
export const myAccount = remote.require('./src/Account');
export const mySettings = remote.require('./src/Settings');
export const LabelType = labels;
export const socketClient = remote.require('./src/socketClient');

const globalManager = remote.require('./src/globalManager');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

export const createTemporalAccount = accountData => {
  return globalManager.temporalAccount.set(accountData);
};

export const getTemporalAccount = () => {
  return globalManager.temporalAccount.get();
};

export const deleteTemporalAccount = () => {
  return globalManager.temporalAccount.delete();
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
