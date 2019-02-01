import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import SettingsWrapper from './../components/SettingsWrapper';
import { addLabel, updateLabel, removeLabel, setAvatarUpdatedTimestamp } from './../actions';
import {
  cleanDataLogout,
  LabelType,
  myAccount,
  mySettings
} from '../utils/electronInterface';
import {
  getUserSettings,
  logout,
  logoutApp,
  openFilledComposerWindow,
  removeDevice,
  resendConfirmationEmail,
  resetPassword,
  updateAccount,
  updateContactByEmail,
  updateNameEvent,
  uploadAvatar,
  setReadTracking
} from './../utils/ipc';
import { appDomain, composerEvents } from '../utils/const';
import { defineLastDeviceActivity } from '../utils/TimeUtils';
import { formContactSupportEmailContent } from '../utils/EmailUtils';
import { toLowerCaseWithoutSpaces } from '../utils/StringUtils';
import { clearStorage } from '../utils/storage';
import {
  sendResetPasswordSendLinkSuccessMessage,
  sendResetPasswordSendLinkErrorMessage
} from '../utils/electronEventInterface';
import string from './../lang';

const defineSystemLabels = labelsArray => {
  return labelsArray
    .filter(label => {
      const isStarred = label.id === LabelType.starred.id;
      return isStarred;
    })
    .map(label => {
      const text =
        label.type === 'system'
          ? string.labelsItems[toLowerCaseWithoutSpaces(label.text)]
          : label.text;
      return { id: label.id, text, visible: label.visible };
    });
};

const defineCustomLabels = labelsArray => {
  return labelsArray.filter(label => label.type === 'custom');
};

const mapStateToProps = state => {
  const labels = state.get('labels').toJS();
  const labelsArray = Object.values(labels);
  const systemLabels = defineSystemLabels(labelsArray);
  const customLabels = defineCustomLabels(labelsArray);
  return {
    systemLabels,
    customLabels
  };
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
          time: device.lastActivity
            ? defineLastDeviceActivity(device.lastActivity.date)
            : null
        },
        isCurrentDevice: device.deviceId === myAccount.deviceId
      };
    })
    .sort(device => !device.isCurrentDevice);
};

const deleteDeviceData = async () => {
  clearStorage();
  await cleanDataLogout(myAccount.recipientId);
  await logoutApp();
};

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: text => {
      const color = randomcolor({
        seed: text,
        luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
      });
      const label = {
        text,
        color: color.replace('#', ''),
        visible: true
      };
      dispatch(addLabel(label));
    },
    onComposeContactSupportEmail: async () => {
      const data = await formContactSupportEmailContent();
      openFilledComposerWindow({
        type: composerEvents.NEW_WITH_DATA,
        data
      });
    },
    onDeleteDeviceData: async () => {
      await deleteDeviceData();
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
    onRemoveLabel: labelId => {
      dispatch(removeLabel(String(labelId)));
    },
    onRemoveDevice: async params => {
      const { status } = await removeDevice(params);
      return status === 200;
    },
    onResendConfirmationEmail: async () => {
      return await resendConfirmationEmail();
    },
    onUpdateAccount: async params => {
      const recipientId = myAccount.recipientId;
      const { name } = params;
      if (name) {
        const res = await updateNameEvent(params);
        if (res.status === 200) {
          await updateAccount({ ...params, recipientId });
        }
      } else {
        await updateAccount({ ...params, recipientId });
      }
    },
    onUpdateContact: async name => {
      const email = `${myAccount.recipientId}@${appDomain}`;
      await updateContactByEmail({ email, name });
    },
    onUpdateLabel: params => {
      dispatch(updateLabel(params));
    },
    onUploadAvatar: async params => {
      const { status } = await uploadAvatar(params);
      dispatch(setAvatarUpdatedTimestamp(Date.now()))
      return status;
    },
    onResetPassword: async () => {
      const { recipientId } = myAccount;
      const { status } = await resetPassword(recipientId);
      if (status === 200) {
        sendResetPasswordSendLinkSuccessMessage();
        return;
      }
      sendResetPasswordSendLinkErrorMessage();
    },
    onSetReadReceiptsTracking: async enabled => {
      const { status } = await setReadTracking(enabled);
      return status;
    }
  };
};

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsWrapper);

export { Settings as default, deleteDeviceData };
