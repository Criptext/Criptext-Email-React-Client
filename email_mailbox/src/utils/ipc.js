import { callMain } from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const openFilledComposerWindow = data => {
  callMain('open-filled-composer', data);
};

export const openEmptyComposerWindow = () => {
  callMain('open-empty-composer');
};
