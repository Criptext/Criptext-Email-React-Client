const { Menu, Tray } = require('electron');
const path = require('path');
const composerWindowManager = require('./composer');
const { isFromStore, quit } = require('./windowUtils');
const globalManager = require('./../globalManager');
const { checkForUpdates } = require('./../updater');

let tray = null;
const mainIcon = path.join(__dirname, './../../resources/icons/png/16x16.png');
const trayIcon = path.join(__dirname, './../../resources/icons/png/32x32.png');

const createTrayIcon = () => {
  const lang = require('./../lang');
  const string = lang.strings.windows.menu.trayIcon;

  const trayIconTemplate = [
    {
      label: string.criptext,
      icon: mainIcon,
      type: 'normal',
      enabled: false
    },
    { type: 'separator' },
    {
      label: string.newEmail,
      type: 'normal',
      click: () => composerWindowManager.openNewComposer()
    },
    {
      label: string.quit,
      type: 'normal',
      click: () => quit()
    }
  ];
  // Criptext menu - Updater (Windows Store)
  if (!isFromStore) {
    trayIconTemplate.splice(3, 0, {
      label: string.checkForUpdates,
      type: 'normal',
      click: checkForUpdates
    });
  }

  if (!isFromStore && !tray) {
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate(trayIconTemplate);
    tray.setToolTip('Criptext');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      const mailboxWindow = require('./mailbox');
      mailboxWindow.show();
    });
  }
};

const destroyTrayIcon = () => {
  if (globalManager.forcequit.get() && tray) {
    tray.destroy();
    tray = null;
  }
};

module.exports = {
  createTrayIcon,
  destroyTrayIcon
};
