const { INSTALLER_TYPE } = require('./utils/const');
const { getDeviceType } = require('./utils/osUtils');
const allInstallerTypes = require('./../installerResources/installerTypes.json');

global.composerData = {};
global.emailToEdit = {};
global.isMAS = INSTALLER_TYPE === allInstallerTypes.mac.store;
global.loadingData = {};
global.temporalAccount = {};
global.windowsEventsDisabled = false;
global.internetConnection;
global.isWindowsStore = INSTALLER_TYPE === allInstallerTypes.windows.store;
global.deviceType = getDeviceType(INSTALLER_TYPE, allInstallerTypes);
global.pendingRestore = false;
global.backupStatus = null;
global.needsUpgrade = false;
global.databaseKey = '';

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

/*  Needs Upgrade
----------------------------- */
const enableUpgrade = () => {
  global.needsUpgrade = true;
};
const disableUpgrade = () => {
  global.needsUpgrade = false;
};

const getNeedsUpgrade = () => {
  return global.needsUpgrade;
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
  needsUpgrade: {
    enable: enableUpgrade,
    disable: disableUpgrade,
    getValue: getNeedsUpgrade
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
  }
};
