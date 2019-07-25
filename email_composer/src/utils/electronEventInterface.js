const { ipcRenderer } = window.require('electron');
const EventEmitter = window.require('events');
const emitter = new EventEmitter();

/*  Link devices
-------------------------*/
ipcRenderer.on('disable-window-link-devices', () => {
  emitter.emit(Event.DISABLE_WINDOW);
});

ipcRenderer.on('enable-window-link-devices', () => {
  emitter.emit(Event.ENABLE_WINDOW);
});

/*  Backup
-------------------------*/
ipcRenderer.on('local-backup-disable-events', () => {
  emitter.emit(Event.DISABLE_WINDOW);
});

ipcRenderer.on('local-backup-enable-events', () => {
  emitter.emit(Event.ENABLE_WINDOW);
});

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = (eventName, callback) => {
  emitter.removeListener(eventName, callback);
};

export const Event = {
  DISABLE_WINDOW: 'add-window-overlay',
  ENABLE_WINDOW: 'remove-window-overlay'
};
