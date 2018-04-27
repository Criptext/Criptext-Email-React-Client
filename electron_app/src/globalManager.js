global.modalData = {};
global.loadingData = {};
global.composerData = {};
global.emailToEdit = undefined;

// Dialog
const setModalData = data => {
  global.modalData = data;
};
const getModalData = () => {
  return global.modalData;
};

// Loading
const setLoadingData = data => {
  global.loadingData = data;
};
const getLoadingData = () => {
  return global.loadingData;
};

// Composer
const setComposerData = data => {
  global.composerData = data;
};
const getComposerData = () => {
  return global.composerData;
};
const setEmailToEdit = data => {
  global.emailToEdit = data;
};
const getEmailToEdit = () => {
  return global.emailToEdit;
};

module.exports = {
  composerData: {
    get: getComposerData,
    set: setComposerData
  },
  emailToEdit: {
    get: getEmailToEdit,
    set: setEmailToEdit
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
