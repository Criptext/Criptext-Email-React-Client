import { getTemporalAccount } from './electronInterface';
import { SocketCommand } from './const';

const { ipcRenderer } = window.require('electron');
const EventEmitter = window.require('events');
const emitter = new EventEmitter();

ipcRenderer.on('socket-message', (ev, message) => {
  const eventType = message.cmd;
  switch (eventType) {
    case SocketCommand.DEVICE_LINK_AUTHORIZATION_CONFIRMATION: {
      return handleDeviceLinkAuthorizationConfirmation(message);
    }
    case SocketCommand.DEVICE_LINK_AUTHORIZATION_DENY: {
      return handleDeviceLinkAuthorizationDeny();
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

const handleDeviceLinkAuthorizationDeny = () => {
  emitter.emit(Event.LINK_DEVICE_DENIED);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = (eventName, callback) => {
  emitter.removeListener(eventName, callback);
};

export const Event = {
  LINK_DEVICE_CONFIRMED: 'link-device-confirmed',
  LINK_DEVICE_DENIED: 'link-device-denied'
};
