import { connect } from 'react-redux';
import SettingsContainer from './../components/SettingsContainer';
import { updateLabel, removeLabel } from './../actions';
import { myAccount } from '../utils/electronInterface';
import {
  cleanDataLogout,
  getUserSettings,
  logout,
  logoutApp,
  removeDevice,
  resetPassword
} from './../utils/ipc';
import { appDomain, SectionType } from '../utils/const';
import { defineLastDeviceActivity } from '../utils/TimeUtils';
import { clearStorage } from '../utils/storage';
import {
  sendResetPasswordSendLinkSuccessMessage,
  sendResetPasswordSendLinkErrorMessage
} from '../utils/electronEventInterface';
import string from '../lang';

const mapStateToProps = () => {
  return {};
};

const formatDevicesData = devices => {
  return devices
    .map(device => {
      return {
        name: device.deviceFriendlyName,
        type: device.deviceType,
        deviceId: device.deviceId,
        lastConnection: {
          place: null,
          time: device.lastActivity.date
            ? defineLastDeviceActivity(device.lastActivity.date)
            : string.settings.over_time
        },
        isCurrentDevice: device.deviceId === myAccount.deviceId
      };
    })
    .sort(device => !device.isCurrentDevice);
};

const deleteDeviceData = async (onUpdateApp, onClickSection) => {
  clearStorage({});
  const nextAccount = await cleanDataLogout({
    recipientId: myAccount.recipientId
  });
  if (nextAccount) {
    const { id, recipientId } = nextAccount;
    const mailbox = {
      id: 1,
      text: 'Inbox'
    };
    onClickSection(SectionType.MAILBOX, { mailboxSelected: mailbox });
    onUpdateApp({ mailbox, accountId: id, recipientId });
    return;
  }
  await logoutApp();
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onDeleteDeviceData: async () => {
      await deleteDeviceData(ownProps.onUpdateApp, ownProps.onClickSection);
    },
    onGetUserSettings: async () => {
      const settings = await getUserSettings();
      const {
        devices,
        recoveryEmail,
        twoFactorAuth,
        recoveryEmailConfirmed,
        readReceiptsEnabled,
        replyTo
      } = settings;
      return {
        devices: formatDevicesData(devices),
        recoveryEmail,
        twoFactorAuth,
        recoveryEmailConfirmed,
        readReceiptsEnabled,
        replyToEmail: replyTo
      };
    },
    onLogout: async () => {
      const res = await logout();
      return res.status === 200;
    },
    onRemoveLabel: (labelId, labelUuid) => {
      dispatch(removeLabel(String(labelId), labelUuid));
    },
    onRemoveDevice: async params => {
      const { status } = await removeDevice(params);
      return status === 200;
    },
    onUpdateLabel: params => {
      dispatch(updateLabel(params));
    },
    onResetPassword: async () => {
      const [recipientId, domain] = myAccount.recipientId.split('@');
      const params = {
        recipientId,
        domain: domain || appDomain
      };
      const { status } = await resetPassword(params);
      if (status === 200) {
        sendResetPasswordSendLinkSuccessMessage();
        return;
      }
      sendResetPasswordSendLinkErrorMessage();
    }
  };
};

const SettingsCont = connect(mapStateToProps, mapDispatchToProps)(
  SettingsContainer
);

export { SettingsCont as default, deleteDeviceData };
