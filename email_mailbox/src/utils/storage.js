const indexedDB = window.indexedDB;
const localStorage = window.localStorage;

export const storeValue = async function(value) {
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

export const getMatches = async function(substring) {
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

const openDB = function() {
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
