import { SocketCommand } from './const';

const { ipcRenderer } = window.require('electron');
const EventEmitter = window.require('events');
const emitter = new EventEmitter();

ipcRenderer.on('socket-message', (ev, message) => {
  const eventType = message.cmd;
  switch (eventType) {
    case SocketCommand.DATA_UPLOADED: {
      return handleDataUploadedEvent(message.params);
    }
    default:
      return;
  }
});

const handleDataUploadedEvent = ({ authorizerId, dataAddress, key }) => {
  emitter.emit(Event.DATA_UPLOADED, authorizerId, dataAddress, key);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = (eventName, callback) => {
  emitter.removeListener(eventName, callback);
};

export const Event = {
  DATA_UPLOADED: 'data-uploaded'
};
