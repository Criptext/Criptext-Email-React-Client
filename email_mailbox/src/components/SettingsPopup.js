import React from 'react';
import PropTypes from 'prop-types';
import PopupHOC from './PopupHOC';
import ChangePasswordPopup from './ChangePasswordPopup';
import ChangeRecoveryEmailPopup from './ChangeRecoveryEmailPopup';
import DeleteAccountPopupWrapper from './DeleteAccountPopupWrapper';
import LogoutPopup from './LogoutPopup';
import ManualSyncPopup from './ManualSyncPopup';
import ManualSyncProcessPopup from './ManualSyncProcessPopup';
import SetReplyToEmailPopup from './SetReplyToEmailPopup';
import TwoFactorAuthEnabledPopup from './TwoFactorAuthEnabledPopup';
import { SETTINGS_POPUP_TYPES } from './SettingAccountWrapper';

const Changepasswordpopup = PopupHOC(ChangePasswordPopup);
const Changerecoveryemailpopup = PopupHOC(ChangeRecoveryEmailPopup);
const Logoutpopup = PopupHOC(LogoutPopup);
const Twofactorauthenabledpopup = PopupHOC(TwoFactorAuthEnabledPopup);
const Deleteaccountpopup = PopupHOC(DeleteAccountPopupWrapper);
const Manualsyncpopup = PopupHOC(ManualSyncPopup);
const Manualsyncprocesspopup = PopupHOC(ManualSyncProcessPopup);
const SetReplyTo = PopupHOC(SetReplyToEmailPopup);

const SettingsPopup = props => {
  const {
    CHANGE_PASSWORD,
    CHANGE_RECOVERY_EMAIL,
    DELETE_ACCOUNT,
    LOGOUT,
    MANUAL_SYNC,
    MANUAL_SYNC_DEVICE_AUTHENTICATION,
    SET_REPLY_TO,
    TWO_FACTOR_AUTH_ENABLED
  } = SETTINGS_POPUP_TYPES;

  switch (props.type) {
    case CHANGE_PASSWORD: {
      return (
        <Changepasswordpopup
          confirmNewPasswordInput={
            props.changePasswordPopupParams.confirmNewPasswordInput
          }
          isDisabledChangePasswordSubmitButton={
            props.changePasswordPopupParams.isDisabledChangePasswordSubmitButton
          }
          isHidden={props.isHidden}
          newPasswordInput={props.changePasswordPopupParams.newPasswordInput}
          oldPasswordInput={props.changePasswordPopupParams.oldPasswordInput}
          onChangeInputValueChangePassword={
            props.onChangeInputValueChangePassword
          }
          onClickChangePasswordInputType={props.onClickChangePasswordInputType}
          onClickForgotPasswordLink={props.onClickForgotPasswordLink}
          onTogglePopup={() => {
            props.onClosePopup();
            props.onClearPopupParams(CHANGE_PASSWORD);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          onConfirmChangePassword={props.onConfirmChangePassword}
        />
      );
    }
    case CHANGE_RECOVERY_EMAIL: {
      return (
        <Changerecoveryemailpopup
          isDisabledChangeRecoveryEmailSubmitButton={
            props.changeRecoveryEmailPopupParams
              .isDisabledChangeRecoveryEmailSubmitButton
          }
          isHidden={props.isHidden}
          onChangeInputValueOnChangeRecoveryEmailPopup={
            props.onChangeInputValueOnChangeRecoveryEmailPopup
          }
          onClickChangeRecoveryEmailInputType={
            props.onClickChangeRecoveryEmailInputType
          }
          onClickForgotPasswordLink={props.onClickForgotPasswordLink}
          onConfirmChangeRecoveryEmail={props.onConfirmChangeRecoveryEmail}
          onTogglePopup={() => {
            props.onClosePopup();
            props.onClearPopupParams(CHANGE_RECOVERY_EMAIL);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          recoveryEmailPopupInputEmail={
            props.changeRecoveryEmailPopupParams.recoveryEmailInput
          }
          recoveryEmailPopupInputPassword={
            props.changeRecoveryEmailPopupParams.recoveryEmailPasswordInput
          }
          theme={'dark'}
        />
      );
    }
    case LOGOUT: {
      return (
        <Logoutpopup
          isHidden={props.isHidden}
          onConfirmLogout={props.onConfirmLogout}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
        />
      );
    }
    case TWO_FACTOR_AUTH_ENABLED: {
      return (
        <Twofactorauthenabledpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case DELETE_ACCOUNT: {
      return (
        <Deleteaccountpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case MANUAL_SYNC: {
      return (
        <Manualsyncpopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case MANUAL_SYNC_DEVICE_AUTHENTICATION: {
      return (
        <Manualsyncprocesspopup
          isHidden={props.isHidden}
          onTogglePopup={props.onClosePopup}
          popupPosition={{ left: '45%', top: '45%' }}
          isClosable={false}
          theme={'dark'}
          {...props}
        />
      );
    }
    case SET_REPLY_TO: {
      return (
        <SetReplyTo
          isHidden={props.isHidden}
          onTogglePopup={() => {
            props.onClosePopup();
            props.onClearPopupParams(SET_REPLY_TO);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    default:
      return null;
  }
};

SettingsPopup.propTypes = {
  isHidden: PropTypes.bool,
  type: PropTypes.string,
  onClickCancelChangePassword: PropTypes.func,
  onClickCancelChangeRecoveryEmail: PropTypes.func
};

export default SettingsPopup;
