const { BrowserWindow } = require('electron');
const path = require('path');
const { checkForUpdates } = require('./../updater');
const { quit } = require('./mailbox');
const composerWindowManager = require('./composer');
const globalManager = require('./../globalManager');
const mainIcon = path.join(__dirname, './../../resources/icons/png/16x16.png');
const trayIcon = path.join(__dirname, './../../resources/icons/png/32x32.png');

const lang = require('./../lang');
const string = lang.windows.menu;

const template = [
  {
    label: string.template.file,
    submenu: [
      {
        label: string.template.newEmail,
        click: function() {
          composerWindowManager.openNewComposer();
        }
      }
    ]
  },
  {
    label: string.template.edit,
    submenu: [
      {
        label: string.template.undo,
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: string.template.redo,
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: string.template.cut,
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: string.template.copy,
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: string.template.paste,
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: string.template.selectAll,
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: string.template.window,
    role: 'window',
    submenu: [
      {
        label: string.template.minimize,
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: string.template.close,
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        label: string.template.developer,
        type: 'submenu',
        submenu: [
          {
            label: string.template.toggleDeveloperTools,
            accelerator:
              process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click(item, focusedWindow) {
              if (focusedWindow) focusedWindow.webContents.toggleDevTools();
            }
          }
        ]
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: string.template.criptext,
    submenu: [
      {
        label: string.template.aboutCriptext,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: string.template.services,
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: string.template.hideCriptext,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: string.template.hideOthers,
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: string.template.showAll,
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: string.template.quit,
        accelerator: 'Command+Q',
        click: function() {
          quit();
        }
      }
    ]
  });
  // Criptext menu - updater
  if (!globalManager.isMAS.get()) {
    template[0].submenu.splice(1, 0, {
      label: string.template.checkForUpdates,
      click: checkForUpdates
    });
  }

  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: string.template.bringAllToFront,
      role: 'front'
    },
    {
      type: 'separator'
    },
    {
      label: string.template.criptext,
      click: function() {
        showWindows();
      }
    }
  );
} else {
  // File menu.
  template[0].submenu.push(
    {
      type: 'separator'
    },
    {
      label: string.template.checkForUpdates,
      click: checkForUpdates
    },
    {
      type: 'separator'
    },
    {
      label: string.template.quit,
      accelerator: 'Alt+F4',
      click: function() {
        quit();
      }
    }
  );
}

const trayIconTemplate = [
  {
    label: string.trayIcon.criptext,
    icon: mainIcon,
    type: 'normal',
    enabled: false
  },
  { type: 'separator' },
  {
    label: string.trayIcon.newEmail,
    type: 'normal',
    click: () => composerWindowManager.openNewComposer()
  },
  {
    label: string.trayIcon.quit,
    type: 'normal',
    click: () => quit()
  }
];

// Criptext menu - updater (Windows Store)
if (!globalManager.isWindowsStore.get()) {
  trayIconTemplate.splice(3, 0, {
    label: string.trayIcon.checkForUpdates,
    type: 'normal',
    click: checkForUpdates
  });
}

const showWindows = () => {
  const visibleWindows = BrowserWindow.getAllWindows();
  visibleWindows.reverse().forEach(w => {
    w.show();
  });
};

module.exports = {
  template,
  showWindows,
  trayIconTemplate,
  trayIcon
};
