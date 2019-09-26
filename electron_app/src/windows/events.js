const EventEmitter = require('events');
const emitter = new EventEmitter();

const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

const removeEvent = (eventName, callback) => {
  emitter.removeListener(eventName, callback);
};

const callEvent = (eventName, data) => {
  emitter.emit(eventName, data);
};

module.exports = {
  addEvent,
  callEvent,
  removeEvent
};
