import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import SettingsWrapper from './../components/SettingsWrapper';
import { addLabel, updateLabel, removeLabel } from './../actions';
import {
  cleanDataBase,
  composerEvents,
  getDevices,
  LabelType,
  logoutApp,
  myAccount,
  openEmailInComposer,
  removeDevice,
  updateAccount,
  updateNameEvent
} from '../utils/electronInterface';
import { appDomain, SocketCommand } from '../utils/const';

const defineSystemLabels = labelsArray => {
  return labelsArray.filter(label => {
    const isStarred = label.id === LabelType.starred.id;
    return isStarred;
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
          time: null
        },
        isCurrentDevice: device.deviceId === myAccount.deviceId
      };
    })
    .sort(device => !device.isCurrentDevice);
};

const deleteDeviceData = async () => {
  await cleanDataBase();
  await logoutApp();
};

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: (text, eventParams) => {
      if (eventParams) {
        const isByEvent = true;
        dispatch(addLabel(eventParams, isByEvent));
      } else {
        const color = randomcolor({
          seed: text,
          luminosity: 'bright'
        });
        const label = {
          text,
          color,
          visible: true
        };
        dispatch(addLabel(label));
      }
    },
    onComposeContactSupportEmail: () => {
      openEmailInComposer({
        type: composerEvents.NEW_WITH_DATA,
        data: {
          email: { subject: 'Customer Support - Desktop' },
          recipients: {
            to: { name: 'Contact Support', email: `support@${appDomain}` }
          }
        }
      });
    },
    onGetDevices: async () => {
      const res = await getDevices();
      return res.status === 200 ? formatDevicesData(res.body) : [];
    },
    onUpdateAccount: async params => {
      const recipientId = myAccount.recipientId;
      const { name } = params;
      if (name) {
        const res = await updateNameEvent({
          cmd: SocketCommand.PEER_USER_NAME_CHANGED,
          params: { name }
        });
        if (res.status === 200) {
          await updateAccount({ ...params, recipientId });
        }
      } else {
        await updateAccount({ ...params, recipientId });
      }
    },
    onUpdateLabel: params => {
      dispatch(updateLabel(params));
    },
    onLogout: async () => {
      const { deviceId } = myAccount;
      const res = await removeDevice(deviceId);
      return res.status === 200;
    },
    onDeleteDeviceData: async () => {
      await deleteDeviceData();
    },
    onRemoveLabel: labelId => {
      dispatch(removeLabel(String(labelId)));
    },
    onRemoveDevice: async deviceId => {
      const { status } = await removeDevice(deviceId);
      return status === 200;
    }
  };
};

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsWrapper);

export { Settings as default, deleteDeviceData };
