const indexedDB = window.indexedDB;
const localStorage = window.localStorage;

export const storeValue = async value => {
  const db = await openDB();
  const tx = db.transaction('searchs', 'readwrite');
  const store = tx.objectStore('searchs');
  store.put({
    value,
    date: Date.now()
  });
  db.close();
  return Promise.resolve();
};

export const getMatches = async substring => {
  const db = await openDB();
  const tx = db.transaction('searchs', 'readwrite');
  const store = tx.objectStore('searchs');
  const index = store.index('date');
  const request = index.openCursor(null, 'prev');

  return new Promise(resolve => {
    const matches = [];
    request.onsuccess = ev => {
      const cursor = ev.target.result;
      if (cursor) {
        if (cursor.value.value.indexOf(substring) > -1) {
          matches.push(cursor.value.value);
        }
        cursor.continue();
      } else {
        db.close();
        resolve(matches);
      }
    };
  });
};

const openDB = () => {
  return new Promise(resolve => {
    const open = indexedDB.open('email_client');

    open.onupgradeneeded = function() {
      const db = open.result;
      const store = db.createObjectStore('searchs', { keyPath: 'value' });
      store.createIndex('date', 'date', { unique: true });
    };

    open.onsuccess = function() {
      resolve(open.result);
    };
  });
};

export const storeSeenTimestamp = () => {
  localStorage.setItem('seenTimestamp', Date.now());
};

export const getSeenTimestamp = () => {
  return localStorage.getItem('seenTimestamp') || null;
};

export const storeResendConfirmationTimestamp = miliseconds => {
  localStorage.setItem('resendConfirmationTimestamp', miliseconds);
};

export const getResendConfirmationTimestamp = () => {
  const timestamp = Number(localStorage.getItem('resendConfirmationTimestamp'));
  return isNaN(timestamp) ? null : timestamp;
};

export const setTwoFactorAuthStatus = enable => {
  localStorage.setItem('twoFactorAuthStatus', enable);
};

export const getTwoFactorAuthStatus = () => {
  return localStorage.getItem('twoFactorAuthStatus') || undefined;
};

export const setLastRecoveryEmail = recoveryEmail => {
  localStorage.setItem('lastRecoveryEmail', recoveryEmail);
};

export const getLastRecoveryEmail = () => {
  return localStorage.getItem('lastRecoveryEmail') || undefined;
};

export const setLastRecoveryEmailConfirmed = recoveryEmailConfirmed => {
  localStorage.setItem('lastRecoveryEmailConfirmed', recoveryEmailConfirmed);
};

export const getLastRecoveryEmailConfirmed = () => {
  return localStorage.getItem('lastRecoveryEmailConfirmed') || undefined;
};

export const clearStorage = () => {
  localStorage.clear();
};

export const setShowEmailPreviewStatus = status => {
  localStorage.setItem('showEmailPreviewStatus', status);
};

export const getShowEmailPreviewStatus = () => {
  return localStorage.getItem('showEmailPreviewStatus') === 'true';
};

const initShowEmailPreviewStatus = () => {
  if (localStorage.getItem('showEmailPreviewStatus') === null) {
    setShowEmailPreviewStatus(true);
  }
};
initShowEmailPreviewStatus();
