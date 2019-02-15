const { Menu } = require('electron');
const { checkForUpdates } = require('./../updater');
const composerWindowManager = require('./composer');
const { isFromStore, showWindows, quit } = require('./windowUtils');

const createAppMenu = () => {
  const lang = require('./../lang');
  const string = lang.strings.windows.menu.template;

  const separatorItem = { type: 'separator' };

  const baseMenuTemplate = [
    {
      label: string.file,
      submenu: [
        {
          label: string.newEmail,
          click: () => composerWindowManager.openNewComposer()
        }
      ]
    },
    {
      label: string.edit,
      submenu: [
        {
          label: string.undo,
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: string.redo,
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        separatorItem,
        {
          label: string.cut,
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: string.copy,
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: string.paste,
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: string.selectAll,
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: string.window,
      role: 'window',
      submenu: [
        {
          label: string.minimize,
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: string.close,
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        {
          label: string.developer,
          type: 'submenu',
          submenu: [
            {
              label: string.toggleDeveloperTools,
              accelerator:
                process.platform === 'darwin'
                  ? 'Alt+Command+I'
                  : 'Ctrl+Shift+I',
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
    baseMenuTemplate.unshift({
      label: string.criptext,
      submenu: [
        {
          label: string.aboutCriptext,
          role: 'about'
        },
        separatorItem,
        {
          label: string.services,
          role: 'services',
          submenu: []
        },
        separatorItem,
        {
          label: string.hideCriptext,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: string.hideOthers,
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: string.showAll,
          role: 'unhide'
        },
        separatorItem,
        {
          label: string.quit,
          accelerator: 'Command+Q',
          click: () => quit()
        }
      ]
    });
    // Criptext menu - updater
    if (!isFromStore) {
      baseMenuTemplate[0].submenu.splice(1, 0, {
        label: string.checkForUpdates,
        click: checkForUpdates
      });
    }

    // Window menu.
    baseMenuTemplate[3].submenu.push(
      separatorItem,
      {
        label: string.bringAllToFront,
        role: 'front'
      },
      separatorItem,
      {
        label: string.criptext,
        click: () => showWindows()
      }
    );
  } else {
    // File menu.
    baseMenuTemplate[0].submenu.push(
      separatorItem,
      {
        label: string.checkForUpdates,
        click: checkForUpdates
      },
      separatorItem,
      {
        label: string.quit,
        accelerator: 'Alt+F4',
        click: () => quit()
      }
    );
  }

  // Add menu to app
  const menu = Menu.buildFromTemplate(baseMenuTemplate);
  Menu.setApplicationMenu(menu);
};

module.exports = { createAppMenu };
