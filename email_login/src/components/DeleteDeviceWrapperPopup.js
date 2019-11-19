import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DeleteDevicePopup from './DeleteDevicePopup';
import { ButtonState } from './Button';
import { popupType } from './PanelWrapper';
import { validatePassword } from '../validators/validators';
import { hashPassword } from '../utils/HashUtils';
import { deleteDeviceToken, findDevices } from '../utils/ipc';
import { appDomain } from '../utils/const';
import string from './../lang';

const { deleteDevices } = string.popUp;

class DeleteDeviceWrapperPopup extends Component {
  constructor() {
    super();
    this.state = {
      confirmButtonState: ButtonState.DISABLED,
      deviceIdsChecked: [],
      errorInputPassword: '',
      isInputPasswordShow: false,
      step: 0,
      valueInputPassword: ''
    };
    this.recipientId = undefined;
    this.domain = undefined;
    this.token = undefined;
  }

  render() {
    const inputPassword = deleteDevices[this.state.step].inputs
      ? deleteDevices[this.state.step].inputs.password
      : undefined;
    const counterDeviceChecked = this.state.deviceIdsChecked.length;
    const textButtonConfirm =
      this.state.step === 1 && counterDeviceChecked
        ? `${
            deleteDevices[this.state.step].buttons.confirm
          }(${counterDeviceChecked})`
        : deleteDevices[this.state.step].buttons.confirm;
    return (
      <DeleteDevicePopup
        confirmButtonState={this.state.confirmButtonState}
        devices={this.state.devices}
        errorInputPassword={this.state.errorInputPassword}
        isInputPasswordShow={this.state.isInputPasswordShow}
        inputPassword={inputPassword}
        note={deleteDevices[this.state.step].note}
        valueInputPassword={this.state.valueInputPassword}
        onChangeInputPassword={this.handleChangeInputPassword}
        onClickCancel={this.handleClickCancel}
        onClickConfirm={this.handleClickConfirm}
        onClickDeviceItem={this.handleClickDeviceItem}
        onClickInputPasswordIcon={this.handleClickInputPasswordIcon}
        onKeyDownInputPassword={this.handleKeyDownInputPassword}
        paragraph={deleteDevices[this.state.step].paragraph}
        step={this.state.step}
        textButtonCancel={deleteDevices[this.state.step].buttons.cancel}
        textButtonConfirm={textButtonConfirm}
        title={deleteDevices[this.state.step].title}
      />
    );
  }

  checkStateButtonConfirm = () => {
    if (this.state.step === 0) {
      const isValid = this.validatePassword();
      const confirmButtonState = isValid
        ? ButtonState.ENABLED
        : ButtonState.DISABLED;
      this.setState({
        confirmButtonState
      });
    }
  };

  handleChangeInputPassword = e => {
    const password = e.target.value;
    const errorInputPassword = '';
    this.setState({ errorInputPassword, valueInputPassword: password }, () => {
      this.checkStateButtonConfirm();
    });
  };

  handleClickCancel = (e, id) => {
    if (id === 0) {
      this.props.onDismiss();
    } else if (id === 1) {
      this.token = undefined;
      this.setState(state => ({
        confirmButtonState: ButtonState.DISABLED,
        step: state.step - 1,
        valueInputPassword: ''
      }));
    }
  };

  handleClickConfirm = (e, step) => {
    switch (step) {
      case 0:
        this.requestFindDevices();
        break;
      case 1:
        this.requestDeleteDevices();
        break;
      case 2:
        break;
      case 3:
        this.props.onDismiss();
        break;
      default:
        break;
    }
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
      const confirmButtonState = !deviceIdsChecked.length
        ? ButtonState.DISABLED
        : ButtonState.ENABLED;
      return { ...state, confirmButtonState, devices, deviceIdsChecked };
    });
  };

  handleClickInputPasswordIcon = () => {
    this.setState(state => {
      return { isInputPasswordShow: !state.isInputPasswordShow };
    });
  };

  handleKeyDownInputPassword = (e, step) => {
    if (e.key === 'Enter') {
      this.handleClickConfirm(e, step);
    }
  };

  validatePassword = () => {
    return validatePassword(this.state.valueInputPassword);
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
      this.props.devicesDeleted(this.state.valueInputPassword);
    } else if (res.status === 400) {
      this.token = undefined;
      this.setState({
        step: 3,
        valueInputPassword: '',
        confirmButtonState: ButtonState.ENABLED
      });
    }
  };

  requestFindDevices = async () => {
    this.setState({
      confirmButtonState: ButtonState.LOADING
    });
    const [recipientId, domain] = this.props.emailAddress.split('@');
    this.recipientId = recipientId;
    this.domain = domain || appDomain;
    const password = hashPassword(this.state.valueInputPassword);
    const params = {
      recipientId,
      domain: this.domain,
      password
    };

    const res = await findDevices(params);
    if (res.status === 200) {
      const devices = res.body.devices.map(device => {
        return {
          checked: false,
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          lastActivity: device.lastActivity,
          name: device.deviceFriendlyName
        };
      });
      this.setState(state => ({
        confirmButtonState: ButtonState.ENABLED,
        devices,
        step: state.step + 1
      }));
      this.token = res.body.token;
    } else if (res.status === 400) {
      const errorInputPassword =
        deleteDevices[this.state.step].inputs.password.error;
      this.setState({
        errorInputPassword,
        confirmButtonState: ButtonState.DISABLED
      });
    } else if (res.status === 429) {
      const popup = popupType.TOO_MANY_REQUEST;
      this.props.setPopupContent(popup);
      this.setState({
        confirmButtonState: ButtonState.ENABLED
      });
    }
  };
}

DeleteDeviceWrapperPopup.propTypes = {
  devicesDeleted: PropTypes.func,
  emailAddress: PropTypes.string,
  onDismiss: PropTypes.func,
  setPopupContent: PropTypes.func
};

export default DeleteDeviceWrapperPopup;
