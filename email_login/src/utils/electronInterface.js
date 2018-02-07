const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


export const closeLogin = () => {
	ipcRenderer.send('close-login');
}

export const resizeSignUp = () => {
  ipcRenderer.send('resizeSignUp');
};

export const resizeLogin = () => {
  ipcRenderer.send('resizeLogin');
};

export const showDialog = (callback) => {
	ipcRenderer.send('open-modal');
	ipcRenderer.on('selectedOption' , (event, data) => { 
		callback(data.selectedOption);
	});
};

export const closeDialog = () => {
	ipcRenderer.send('close-modal');
}

export const openMailbox = () => {
	ipcRenderer.send('open-mailbox');
}