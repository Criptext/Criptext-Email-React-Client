const electron = window.require('electron');
const { ipcRenderer } = electron;
const EventEmitter = require('events');

const emitter = new EventEmitter();

ipcRenderer.on('socket', (event, data) => {  
    console.log("holis")
    console.log(data);
    emitter.emit('socket', data)
});

export const addEvent = (eventName, callback) => {
    emitter.addListener(eventName, callback);
}

export const removeEvent = (eventName) => {
    emitter.removeEvent(eventName);
}