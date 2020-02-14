import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { hashPassword } from '../utils/hashUtils';
import { validatePassword } from '../validators/validators';
import { myAccount, requiredMinLength } from './../utils/electronInterface';
import DeleteAccountPopup from './DeleteAccountPopup';
import { cleanDataLogout, deleteMyAccount, logoutApp } from '../utils/ipc';
import { clearStorage } from '../utils/storage';
import string from '../lang';
import {
  sendAccountDeletedEvent,
  selectAccountAsActive
} from './../utils/electronEventInterface';

const { inputs } = string.popups.delete_account;

class DeleteAccountPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabledConfirmButton: true,
      isDisabledInput: false,
      type: 'password',
      icon: 'icon-not-show',
      value: '',
      errorMessage: '',
      hasError: false
    };
  }

  render() {
    return (
      <DeleteAccountPopup
        isDisabledConfirmButton={this.state.isDisabledConfirmButton}
        isDisabledInput={this.state.isDisabledInput}
        type={this.state.type}
        icon={this.state.icon}
        value={this.state.value}
        errorMessage={this.state.errorMessage}
        hasError={this.state.hasError}
        onChangeInputValue={this.handleChangeInputValue}
        onClickCancelDeleteAccount={this.handleClickCancelDeleteAccount}
        onClickChangeInputType={this.handleClickChangeInputType}
        onClickConfirmDeleteAccount={this.handleClickConfirmDeleteAccount}
        {...this.props}
      />
    );
  }

  handleChangeInputValue = ev => {
    const value = ev.target.value.trim();
    const { hasError, errorMessage } = this.checkInputError(value);
    this.setState({ value, hasError, errorMessage }, () => {
      this.checkDisabledConfirmButton();
    });
  };

  checkInputError = value => {
    const isValid = validatePassword(value);
    const { prefix, suffix } = inputs.password.errorMessages.length;
    const errorMessage = `${prefix} ${requiredMinLength.password} ${suffix}`;
    return { hasError: !isValid, errorMessage };
  };

  checkDisabledConfirmButton = () => {
    const isDisabledConfirmButton = this.state.hasError;
    this.setState({ isDisabledConfirmButton });
  };

  handleClickChangeInputType = () => {
    const [type, icon] =
      this.state.type === 'password'
        ? ['text', 'icon-show']
        : ['password', 'icon-not-show'];
    this.setState({ type, icon });
  };

  handleClickCancelDeleteAccount = () => {
    this.props.onTogglePopup();
  };

  handleClickConfirmDeleteAccount = async () => {
    const params = hashPassword(this.state.value);
    const { status } = await deleteMyAccount(params);
    if (status === 200) {
      this.props.onTogglePopup();
      sendAccountDeletedEvent();
      clearStorage({});
      const nextAccount = await cleanDataLogout({
        recipientId: myAccount.recipientId,
        deleteAll: true
      });
      if (nextAccount) {
        const { id, recipientId } = nextAccount;
        return await selectAccountAsActive({ accountId: id, recipientId });
      }
      clearStorage({ deleteAll: true });
      await logoutApp();
    } else {
      this.setState({
        hasError: true,
        errorMessage: inputs.password.errorMessages.wrong
      });
    }
  };
}

DeleteAccountPopupWrapper.propTypes = {
  onTogglePopup: PropTypes.func
};

export default DeleteAccountPopupWrapper;
