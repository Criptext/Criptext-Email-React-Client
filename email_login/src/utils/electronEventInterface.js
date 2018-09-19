import { getTemporalAccount } from './electronInterface';

const { ipcRenderer, remote } = window.require('electron');
const { SocketCommand } = remote.require('./src/utils/const');
const EventEmitter = window.require('events');
const emitter = new EventEmitter();

ipcRenderer.on('socket-message', (ev, message) => {
  const eventType = message.cmd;
  switch (eventType) {
    case SocketCommand.DEVICE_LINK_AUTHORIZATION_CONFIRMATION: {
      return handleDeviceLinkAuthorizationConfirmation(message);
    }
    default:
      return;
  }
});

const handleDeviceLinkAuthorizationConfirmation = ({ params }) => {
  const { deviceId, name } = params;
  const { recipientId } = getTemporalAccount();
  const eventParams = {
    deviceId,
    recipientId,
    name
  };
  emitter.emit(Event.LINK_DEVICE_CONFIRMED, eventParams);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = (eventName, callback) => {
  emitter.removeListener(eventName, callback);
};

export const Event = {
  LINK_DEVICE_CONFIRMED: 'link-device-confirmed'
};
