const { INSTALLER_TYPE } = require('./utils/const');
const { getDeviceType } = require('./utils/osUtils');
const allInstallerTypes = require('./../installerResources/installerTypes.json');

global.composerData = {};
global.emailToEdit = {};
global.isMAS = INSTALLER_TYPE === allInstallerTypes.mac.store;
global.loadingData = {};
global.loginData = {};
global.pinData = {};
global.temporalAccount = {};
global.windowsEventsDisabled = false;
global.internetConnection;
global.isWindowsStore = INSTALLER_TYPE === allInstallerTypes.windows.store;
global.deviceType = getDeviceType(INSTALLER_TYPE, allInstallerTypes);
global.pendingRestore = false;
global.backupStatus = null;
global.databaseKey = '';
global.progressDBE = { total: 4, current: 1 };

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
  if (data.remoteData) {
    const deviceType = global.deviceType;
    const remoteData = { ...data.remoteData, deviceType };
    const dataUpdated = { ...data, remoteData };
    global.loadingData = dataUpdated;
    return;
  }
  global.loadingData = data;
};
const getLoadingData = () => {
  return global.loadingData;
};

/*  Login
----------------------------- */
const setLoginData = data => {
  global.loginData = data;
};
const getLoginData = () => {
  return global.loginData;
};

/*  Pin
----------------------------- */
const setPinData = data => {
  global.pinData = data;
};
const getPinData = () => {
  return global.pinData;
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

/*  Windows Events
----------------------------- */
const disableWindowsEvents = () => {
  global.windowsEventsDisabled = true;
};

const enableWindowsEvents = () => {
  global.windowsEventsDisabled = false;
};

const checkWindowsEvents = () => {
  return global.windowsEventsDisabled;
};

const setInternetConnectionStatus = status => {
  global.internetConnection = status;
};

const getInternetConnectionStatus = () => {
  return global.internetConnection;
};

/*  Pending Restore
----------------------------- */
const setPendingRestoreStatus = status => {
  global.pendingRestore = status;
};

const getPendingRestoreStatus = () => {
  return global.pendingRestore;
};

/*  Backup status
----------------------------- */
const setBackupStatus = status => {
  global.backupStatus = status;
};
const getBackupStatus = () => {
  return global.backupStatus;
};

/*  Database Encrypted
----------------------------- */
const setDatabaseKey = key => {
  global.databaseKey = key;
};

const getDatabaseKey = () => {
  return global.databaseKey;
};

const setProgressDBE = ({ current, add }) => {
  let valueCurrent = current;
  if (add) valueCurrent = global.progressDBE.current + add;
  global.progressDBE = { ...global.progressDBE, current: valueCurrent };
};

const getProgressDBE = () => {
  return global.progressDBE;
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
  loginData: {
    get: getLoginData,
    set: setLoginData
  },
  pinData: {
    get: getPinData,
    set: setPinData
  },
  temporalAccount: {
    get: getTemporalAccountData,
    set: setTemporalAccountData,
    delete: deleteTemporalAccountData
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
  },
  deviceType: {
    id: global.deviceType
  },
  pendingRestore: {
    get: getPendingRestoreStatus,
    set: setPendingRestoreStatus
  },
  backupStatus: {
    get: getBackupStatus,
    set: setBackupStatus
  },
  databaseKey: {
    get: getDatabaseKey,
    set: setDatabaseKey
  },
  progressDBE: {
    get: getProgressDBE,
    set: setProgressDBE
  }
};
