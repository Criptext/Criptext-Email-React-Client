global.modalData = {};
global.loadingData = {};
global.composerData = {};
global.emailToEdit = {};

// Dialog
const setModalData = data => {
  global.modalData = data;
};
const getModalData = () => {
  return global.modalData;
};

// Force quit
const setForceQuit = data => {
  global.forcequit = data;
};
const getForceQuit = () => {
  return global.forcequit;
};

// Loading
const setLoadingData = data => {
  global.loadingData = data;
};
const getLoadingData = () => {
  return global.loadingData;
};

// Composer
const setComposerData = (composerId, data) => {
  global.composerData[composerId] = data;
};
const getComposerData = composerId => {
  return global.composerData[composerId];
};
const deleteComposerData = composerId => {
  delete global.composerData[composerId];
};
const setEmailToEdit = (composerId, data) => {
  global.emailToEdit[composerId] = data;
};
const getEmailToEdit = composerId => {
  return global.emailToEdit[composerId];
};

module.exports = {
  composerData: {
    get: getComposerData,
    set: setComposerData,
    delete: deleteComposerData
  },
  emailToEdit: {
    get: getEmailToEdit,
    set: setEmailToEdit
  },
  forcequit: {
    get: getForceQuit,
    set: setForceQuit
  },
  loadingData: {
    get: getLoadingData,
    set: setLoadingData
  },
  modalData: {
    get: getModalData,
    set: setModalData
  }
};
