import { callMain } from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const closeDialog = () => {
  callMain('close-dialog');
};

export const downloadUpdate = () => {
  callMain('download-update');
};

export const logoutApp = () => {
  callMain('logout-app');
};

export const openEmptyComposerWindow = () => {
  callMain('open-empty-composer');
};

export const openFilledComposerWindow = data => {
  callMain('open-filled-composer', data);
};

export const openFileExplorer = filename => {
  callMain('open-file-explorer', filename);
};

export const throwError = error => {
  callMain('throwError', error);
};
