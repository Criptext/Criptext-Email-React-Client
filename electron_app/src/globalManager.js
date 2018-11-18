global.composerData = {};
global.emailToEdit = {};
global.isMAS = false;
global.loadingData = {};
global.modalData = {};
global.screenSize = {};
global.temporalAccount = {};
global.windowsEventsDisabled = false;
global.internetConnection;
global.isWindowsStore = false;

/*  Composer
----------------------------- */
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

/*  Dialog
----------------------------- */
const setModalData = data => {
  global.modalData = data;
};
const getModalData = () => {
  return global.modalData;
};

/*  Force quit
----------------------------- */
const setForceQuit = data => {
  global.forcequit = data;
};
const getForceQuit = () => {
  return global.forcequit;
};

/*  Loading
----------------------------- */
const setLoadingData = data => {
  global.loadingData = data;
};
const getLoadingData = () => {
  return global.loadingData;
};

/*  App Store (Mac & Windows)
----------------------------- */
const getMAS = () => {
  return global.isMAS;
};

const getWinStore = () => {
  return global.isWindowsStore;
};

/*  Temporal Account
----------------------------- */
const setTemporalAccountData = data => {
  global.temporalAccount = data;
};
const getTemporalAccountData = () => {
  return global.temporalAccount;
};
const deleteTemporalAccountData = () => {
  delete global.temporalAccount;
};

const saveScreenSize = size => {
  global.screenSize = size;
};

const getScreenSize = () => {
  return global.screenSize;
};

/*  Windows Events
----------------------------- */
const disableWindowsEvents = () => {
  global.windowsEventsDisabled = true;
};

const enableWindowsEvents = () => {
  global.windowsEventsDisabled = true;
};

const checkWindowsEvents = () => {
  return global.windowsEventsDisabled;
};

/*  Windows Events
----------------------------- */
const setInternetConnectionStatus = status => {
  global.internetConnection = status;
};

const getInternetConnectionStatus = () => {
  return global.internetConnection;
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
  isMAS: {
    get: getMAS
  },
  loadingData: {
    get: getLoadingData,
    set: setLoadingData
  },
  modalData: {
    get: getModalData,
    set: setModalData
  },
  temporalAccount: {
    get: getTemporalAccountData,
    set: setTemporalAccountData,
    delete: deleteTemporalAccountData
  },
  screenSize: {
    get: getScreenSize,
    save: saveScreenSize
  },
  windowsEvents: {
    disable: disableWindowsEvents,
    enable: enableWindowsEvents,
    checkDisabled: checkWindowsEvents
  },
  internetConnection: {
    setStatus: setInternetConnectionStatus,
    getStatus: getInternetConnectionStatus
  },
  isWindowsStore: {
    get: getWinStore
  }
};
