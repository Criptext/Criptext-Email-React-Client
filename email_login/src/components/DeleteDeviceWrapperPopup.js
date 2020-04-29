import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DeleteDevicePopup from './DeleteDevicePopup';
import { ButtonState } from './Button';
import { deleteDeviceToken, getMaxDevices } from '../utils/ipc';
import string from './../lang';
import { appDomain } from '../utils/const';
import { addEvent, removeEvent } from '../utils/electronEventInterface';

const { deleteDevices } = string.popUp;

class DeleteDeviceWrapperPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmButtonState: ButtonState.DISABLED,
      deviceIdsChecked: [],
      devices: props.devices,
      maxDevices: 10
    };
    const [myRecipientId, myDomain = appDomain] = props.emailAddress.split('@');
    this.recipientId = myRecipientId;
    this.domain = myDomain;
    this.token = props.token;
  }

  render() {
    const devicesToRemove =
      1 +
      this.state.devices.length -
      this.state.maxDevices -
      this.state.deviceIdsChecked.length;
    const textButtonConfirm = `${deleteDevices[1].buttons.confirm} (${
      this.state.deviceIdsChecked.length
    })`;
    return (
      <DeleteDevicePopup
        confirmButtonState={this.state.confirmButtonState}
        devices={this.state.devices}
        devicesToRemove={devicesToRemove < 0 ? 0 : devicesToRemove}
        onClickCancel={this.handleClickCancel}
        onClickConfirm={this.handleClickConfirm}
        onClickDeviceItem={this.handleClickDeviceItem}
        paragraph={deleteDevices[1].paragraph}
        textButtonCancel={deleteDevices[1].buttons.cancel}
        textButtonConfirm={textButtonConfirm}
        title={deleteDevices[1].title}
      />
    );
  }

  componentDidMount() {
    this.requestMaxDevices();
    addEvent('get-max-devices', this.requestMaxDevices);
  }

  componentWillMount() {
    removeEvent('get-max-devices', this.requestMaxDevices);
  }

  handleClickCancel = () => {
    this.props.onDismiss();
  };

  handleClickConfirm = () => {
    this.requestDeleteDevices();
  };

  handleClickDeviceItem = (e, id) => {
    const deviceIdsChecked = [];
    this.setState(state => {
      const devices = state.devices.map((device, index) => {
        if (index === id) {
          const checked = !device.checked;
          if (checked) deviceIdsChecked.push(device.deviceId);
          return { ...device, checked };
        }
        if (device.checked) deviceIdsChecked.push(device.deviceId);
        return device;
      });
      const devicesToRemove =
        1 +
        this.state.devices.length -
        this.state.maxDevices -
        deviceIdsChecked.length;
      const confirmButtonState =
        devicesToRemove > 0 ? ButtonState.DISABLED : ButtonState.ENABLED;
      return { ...state, confirmButtonState, devices, deviceIdsChecked };
    });
  };

  requestMaxDevices = async () => {
    const params = {
      token: this.token,
      recipientId: this.recipientId
    };
    const res = await getMaxDevices(params);

    if (!res) {
      return;
    }

    switch (res.status) {
      case 200: {
        const maxDevices = res.body.maxDevices;
        if (maxDevices > this.state.devices.length) {
          this.props.devicesDeleted(this.props.password);
          break;
        }
        this.setState({
          maxDevices
        });
        break;
      }
      default:
        break;
    }
  };

  requestDeleteDevices = async () => {
    this.setState({
      confirmButtonState: ButtonState.LOADING
    });
    const params = {
      recipientId: this.recipientId,
      domain: this.domain,
      deviceIds: this.state.deviceIdsChecked,
      token: this.token
    };
    const res = await deleteDeviceToken(params);
    if (res.status === 200) {
      this.props.devicesDeleted(this.props.password);
    } else if (res.status === 400) {
      this.props.onDismiss();
    }
  };
}

DeleteDeviceWrapperPopup.propTypes = {
  devices: PropTypes.array,
  devicesDeleted: PropTypes.func,
  emailAddress: PropTypes.string,
  onDismiss: PropTypes.func,
  password: PropTypes.string,
  token: PropTypes.string
};

export default DeleteDeviceWrapperPopup;
