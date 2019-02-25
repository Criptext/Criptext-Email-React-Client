const { Notification } = require('electron');
const globalManager = require('./globalManager');
const { isMacOS } = require('./windows/windowUtils');
const path = require('path');

const iconPath = path.join(__dirname, './../resources/launch-icons/icon.png');

const showNotification = ({ title, message, clickHandler, closeOnClick }) => {
  const mailboxWindow = require('./windows/mailbox');
  const isSupportedByOS = Notification.isSupported();
  const isVisibleAndFocused = mailboxWindow.isVisibleAndFocused();
  const isMAS = globalManager.isMAS.get();
  if (isSupportedByOS && !isMAS && !isVisibleAndFocused) {
    const notifyOptions = {
      title,
      body: message
    };
    if (!isMacOS) {
      notifyOptions['icon'] = iconPath;
    }
    const notificationItem = new Notification(notifyOptions);
    if (closeOnClick) {
      notificationItem.on('click', () => {
        notificationItem.close();
      });
    } else if (clickHandler) {
      notificationItem.on('click', clickHandler);
    }
    notificationItem.show();
  }
};

module.exports = { showNotification };
