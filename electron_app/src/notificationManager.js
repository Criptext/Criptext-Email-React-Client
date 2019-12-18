const { Notification } = require('electron');
const globalManager = require('./globalManager');
const { isMacOS } = require('./windows/windowUtils');
const path = require('path');

const notifications = {};
const iconPath = path.join(__dirname, './../resources/launch-icons/icon.png');

const showNotification = ({
  title,
  message,
  clickHandler,
  closeOnClick,
  forceToShow
}) => {
  const id = Symbol();
  const mailboxWindow = require('./windows/mailbox');
  const isSupportedByOS = Notification.isSupported();
  const isVisibleAndFocused = mailboxWindow.isVisibleAndFocused();
  const isMAS = globalManager.isMAS.get();
  if (isSupportedByOS && !isMAS && (forceToShow || !isVisibleAndFocused)) {
    const notifyOptions = {
      title,
      body: message
    };
    if (!isMacOS) {
      notifyOptions['icon'] = iconPath;
    }
    const notificationItem = new Notification(notifyOptions);
    notificationItem.on('close', () => {
      delete notifications[id];
    });
    if (closeOnClick) {
      notificationItem.on('click', () => {
        notificationItem.close();
        delete notifications[id];
      });
    } else if (clickHandler) {
      notificationItem.on('click', () => {
        clickHandler();
        delete notifications[id];
      });
    }
    notifications[id] = notificationItem;
    notificationItem.show();
  }
};

module.exports = { showNotification };
